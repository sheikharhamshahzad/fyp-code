import os
import numpy as np
import torch
import torchaudio
import itertools
from pyannote.audio import Pipeline
from scipy.io.wavfile import write as wav_write
from speechbrain.inference.separation import SepformerSeparation as separator
import shutil

import omegaconf
torch.serialization.add_safe_globals([omegaconf.listconfig.ListConfig])
# Set device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[INFO] Using device: {device}")

# Step 1: Diarization
def run_diarization(audio_path, auth_token):
    print("[1/6] Running diarization...")
    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization", use_auth_token=auth_token)
    pipeline.to(torch.device(device))
    diarization = pipeline(audio_path)
    with open("diarization_output.rttm", "w") as f:
        diarization.write_rttm(f)
    return diarization

# Step 2: Detect overlaps and speaker segments
def detect_overlaps_and_speakers(diarization):
    print("[2/6] Detecting overlaps...")
    overlap_regions = []
    speaker_segments = {}

    for segment, _, speaker in diarization.itertracks(yield_label=True):
        if speaker not in speaker_segments:
            speaker_segments[speaker] = []
        speaker_segments[speaker].append((segment.start, segment.end))

    speakers = list(speaker_segments.keys())

    for (spk1, segs1), (spk2, segs2) in itertools.combinations(speaker_segments.items(), 2):
        for seg1 in segs1:
            for seg2 in segs2:
                start = max(seg1[0], seg2[0])
                end = min(seg1[1], seg2[1])
                if start < end:
                    region = {"start": start, "end": end, "speakers": sorted([spk1, spk2])}
                    if region not in overlap_regions:
                        overlap_regions.append(region)
    return overlap_regions, speaker_segments

# Step 3: Separate overlapping regions using dynamic model
def separate_overlaps(audio_path, overlap_regions):
    print("[3/6] Separating overlaps with SepFormer...")
    audio, sr = torchaudio.load(audio_path)
    separated_data = {}

    for i, region in enumerate(overlap_regions):
        start, end = region["start"], region["end"]
        speakers = region["speakers"]
        n_spk = len(speakers)
        model_tag = "speechbrain/sepformer-wsj03mix" if n_spk == 3 else "speechbrain/sepformer-wsj02mix"

        print(f" - Region {i+1}: {start:.2f}-{end:.2f}s | {n_spk} speakers")

        model = separator.from_hparams(
            source=model_tag,
            savedir=f"pretrained_models/{model_tag.split('/')[-1]}",
            run_opts={"device": device}
        )

        # Extract segment for overlap separation
        segment = audio[:, int(start * sr):int(end * sr)]
        temp_path = f"temp_{i}.wav"
        torchaudio.save(temp_path, segment, sr)

        est_sources = model.separate_file(path=temp_path)

        # Store separated sources by speaker
        for idx, spk in enumerate(speakers):
            if spk not in separated_data:
                separated_data[spk] = []
            waveform = est_sources[:, :, idx].squeeze().cpu().numpy()
            separated_data[spk].append((start, end, waveform))

    return separated_data, sr

def build_tracks(audio_path, sr, speaker_segments, separated_data):
    print("[4/6] Building full-length tracks...")
    audio, _ = torchaudio.load(audio_path)
    total_samples = audio.shape[1]
    tracks = {}

    # Initialize tracks for each speaker with zeros
    for spk, segs in speaker_segments.items():
        full = np.zeros(total_samples)
        for start, end in segs:
            start_idx = int(start * sr)
            end_idx = int(end * sr)
            full[start_idx:end_idx] = audio[0, start_idx:end_idx].numpy()
        tracks[spk] = full

    # Now add the separated audio to the track, making sure there is no overlap
    for spk, regions in separated_data.items():
        for start, end, waveform in regions:
            start_idx = int(start * sr)
            end_idx = start_idx + len(waveform)

            # Check for overlap and prevent overwriting
            if spk in tracks:
                if start_idx < len(tracks[spk]):
                    tracks[spk][start_idx:min(end_idx, len(tracks[spk]))] = waveform[:min(end_idx - start_idx, len(tracks[spk]) - start_idx)]
                else:
                    tracks[spk][start_idx:end_idx] = waveform[:end_idx - start_idx]

    return tracks


# Step 5: Clear the output directory and save tracks using scipy
def save_tracks(tracks, sr, output_dir="outputs/final_tracks"):
    print("[5/6] Saving output WAVs...")
    
    # Clear the output directory before saving new files
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    paths = []
    for spk, signal in tracks.items():
        signal = np.clip(signal, -1.0, 1.0)
        signal_int16 = (signal * 32767).astype(np.int16)
        filename = os.path.join(output_dir, f"{spk}.wav")
        wav_write(filename, sr, signal_int16)
        paths.append(filename)
    return paths

# Main function
def main(audio_path, hf_token):
    diarization = run_diarization(audio_path, hf_token)
    overlap_regions, speaker_segments = detect_overlaps_and_speakers(diarization)
    separated_data, sr = separate_overlaps(audio_path, overlap_regions)
    tracks = build_tracks(audio_path, sr, speaker_segments, separated_data)
    final_paths = save_tracks(tracks, sr)
    print("✅ Final per-speaker files:", final_paths)


if __name__ == "__main__":
    AUDIO_PATH = "test1.wav"
    HF_TOKEN = "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"
    main(AUDIO_PATH, HF_TOKEN)