import os
import shutil
import librosa
import numpy as np
import soundfile as sf
import scipy.io.wavfile
from pyannote.audio import Pipeline

os.environ["SPEECHBRAIN_HUB_STRATEGY"] = "copy"
os.environ["HF_HUB_ENABLE_HARD_LINKS"] = "False"

INPUT_AUDIO = "test.wav"
PROCESSED_AUDIO = "test_fixed.wav"
OUTPUT_FOLDER = "separated_speakers"

if os.path.exists(OUTPUT_FOLDER):
    shutil.rmtree(OUTPUT_FOLDER)  # Delete the folder and contents
os.makedirs(OUTPUT_FOLDER, exist_ok=True)  # Recreate it

y, sr = librosa.load(INPUT_AUDIO, sr=None, mono=False)

if y.ndim > 1:
    print("Stereo audio detected. Converting to mono...")
    y = librosa.to_mono(y)
else:
    print("Audio is already mono.")

print(f"Sample Rate: {sr}, Channels: {1 if y.ndim == 1 else y.shape[0]}, Duration: {len(y)/sr:.2f} sec")

y_resampled = librosa.resample(y, orig_sr=sr, target_sr=16000)
sf.write(PROCESSED_AUDIO, y_resampled, 16000)
print(f"Saved as {PROCESSED_AUDIO}")

pipeline = Pipeline.from_pretrained(
    "pyannote/speech-separation-ami-1.0",
    use_auth_token="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"
)

diarization, sources = pipeline(PROCESSED_AUDIO)

with open("audio.rttm", "w") as rttm:
    diarization.write_rttm(rttm)

num_sources = sources.data.shape[1]
for s in range(num_sources):
    filename = os.path.join(OUTPUT_FOLDER, f"SPEAKER_{s}.wav")

    audio_float = sources.data[:, s]
    max_val = np.max(np.abs(audio_float))
    if max_val > 0:
        audio_float = audio_float / max_val  # Normalize to peak at 1.0

    audio_int16 = np.int16(audio_float * 32767)
    noise = np.random.normal(0, 1, audio_int16.shape) * 0.5
    audio_int16 = np.clip(audio_int16 + noise, -32768, 32767).astype(np.int16)

    scipy.io.wavfile.write(filename, 16000, audio_int16)

print(f"Saved {num_sources} speaker-separated audio files in '{OUTPUT_FOLDER}' folder.")
