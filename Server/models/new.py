from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi import APIRouter  # Import APIRouter to organize routes
import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf
import os
from fastapi.middleware.cors import CORSMiddleware
import subprocess  # Import subprocess for running Speech-Separation.py
from pydub import AudioSegment
from typing import List  # Add this import




app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change this for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Ensure output directory exists
OUTPUT_DIR = "processed_audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# Function to process audio and reduce noise
def denoise_audio(file_bytes, filename):
    try:
        temp_path = f"{OUTPUT_DIR}/temp_{filename}"
        with open(temp_path, "wb") as temp_file:
            temp_file.write(file_bytes)

        # Load the audio file
        y, sr = librosa.load(temp_path, sr=None)
        print(f"Loaded audio: {filename}, Sample Rate: {sr}, Duration: {len(y)/sr:.2f}s")

        # Reduce noise
        reduced_noise_audio = nr.reduce_noise(y=y, sr=sr)
        print("Noise reduction applied")

        # Save the processed file
        output_path = os.path.join(OUTPUT_DIR, f"denoised_{filename}")
        sf.write(output_path, reduced_noise_audio, sr)
        print(f"Saved denoised file: {output_path}")

        os.remove(temp_path)  # Cleanup

        return output_path

    except Exception as e:
        print("Error processing audio:", str(e))
        raise HTTPException(status_code=500, detail="Failed to process audio")


# API to process audio and return denoised file
@app.post("/denoise/")
async def denoise(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        output_path = denoise_audio(file_bytes, file.filename)

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Processed file not found")

        return FileResponse(
            path=os.path.abspath(output_path),
            media_type="audio/wav",
            filename=f"denoised_{file.filename}"
        )

    except Exception as e:
        print("Error in API:", str(e))
        raise HTTPException(status_code=500, detail="Error processing request")
    



# API to download separated speaker files
@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(SPEAKER_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/wav", filename=filename)








# Function to activate a virtual environment and run a script
def run_emotion_script(venv_path: str, script_path: str, args=None):
    try:
        # Prepare the command to activate the virtual environment and run the script
        command = f"{venv_path}\\Scripts\\activate.bat && python {script_path}"
        
        # If you need to pass arguments to the script, add them
        if args:
            command += " " + " ".join(args)

        # Run the command using subprocess
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        words = result.stdout.split()
        uppercase_words = [word for word in words if word.isupper()]
        filtered_output = ' '.join(uppercase_words)


        # Print the result
        print(f"Command Output: {result.stdout}")
        print(f"Command Error: {result.stderr}")
        
        # Return the filtered uppercase characters
        return filtered_output  # Only returns uppercase characters
    
    except Exception as e:
        print(f"Error running model script: {e}")
        return None
    
    
    
    
    
    
    
    
import subprocess
import sys

import subprocess
import sys

def run_model_script(venv_path: str, script_path: str, args=None):
    try:
        # Prepare the command
        command = f'"{venv_path}\\Scripts\\activate.bat" && python "{script_path}"'
        if args:
            command += " " + " ".join(f'"{arg}"' for arg in args)

        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )

        output_lines = []

        # Read line-by-line in real time
        for line in process.stdout:
            print(line, end='')  # Print live to terminal
            output_lines.append(line)

        process.wait()

        if process.returncode != 0:
            raise RuntimeError("Script failed")

        # Return the last non-empty line as the output (assumes the last print is the result path)
        clean_lines = [line.strip() for line in output_lines if line.strip()]
        return clean_lines[-1] if clean_lines else None

    except Exception as e:
        print(f"Error running model script: {e}")
        return None


    
    
    
    
    
    
    
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
EMOTION_VENV_PATH = BASE_DIR / "emotion-detection" / "venv"
EMOTION_SCRIPT_PATH = BASE_DIR / "emotion-detection" / "emotion_detection.py"

@app.post("/predict_emotion/")
async def predict_emotion(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as temp_file:
            temp_file.write(await file.read())

        # Run the emotion detection script within its virtual environment
        output = run_emotion_script(EMOTION_VENV_PATH, EMOTION_SCRIPT_PATH, [temp_path])
        
        # Process the output (for example, parsing predictions from the script)
        if output is None:
            raise HTTPException(status_code=500, detail="Failed to run emotion detection model")

        # Parse output if needed and return
        predicted_emotion = output.strip()  # Modify this based on your script's output
        os.remove(temp_path)  # Clean up temp file

        return JSONResponse(content={"emotion": predicted_emotion})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    
    
    
    


TRANSLATION_VENV_PATH = BASE_DIR / "translation-with-cloning" / ".venv"
TRANSLATION_SCRIPT_PATH = BASE_DIR / "translation-with-cloning" / "voice_retention.py"

@app.post("/translate_with_voice_retention/")
async def translate_with_voice_retention(
    file: UploadFile = File(...),
    target_language: str = Form(...)
):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as temp_file:
            temp_file.write(await file.read())

        # Run the translation script with both the audio path and target language as arguments
        output = run_model_script(
            TRANSLATION_VENV_PATH,
            TRANSLATION_SCRIPT_PATH,
            [temp_path, target_language]
        )
        
        if output is None:
            raise HTTPException(status_code=500, detail="Failed to run translation model")

        print(f"Full script output:\n{output}")
        translated_audio_path = output.strip()  # Output should be the path to the generated audio
        os.remove(temp_path)  # Clean up uploaded temp file

        return FileResponse(translated_audio_path, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    
    
    



# Define the separated speakers folder
SPEAKER_DIR = "outputs/final_tracks"

# Ensure the folder exists
os.makedirs(SPEAKER_DIR, exist_ok=True)

# Path to the virtual environment and script for speech separation
SPEECH_SEPARATION_VENV_PATH = BASE_DIR / "speech-separation" / "venv"
SPEECH_SEPARATION_SCRIPT_PATH = BASE_DIR / "speech-separation" / "speech_separation.py"
@app.post("/separate_speakers/")
async def separate_speakers(file: UploadFile = File(...)):
    try:
        # Save uploaded file as "test.wav"
        audio_path = "test.wav"
        with open(audio_path, "wb") as audio_file:
            audio_file.write(await file.read())

        # Run the speech separation script within its virtual environment
        output = run_model_script(SPEECH_SEPARATION_VENV_PATH, SPEECH_SEPARATION_SCRIPT_PATH, [audio_path])

        # Check the output (assuming the script generates the separated audio files)
        if output is None:
            raise HTTPException(status_code=500, detail="Failed to run speech separation model")

        # Parse the output string to get the file paths
        # The output should be a string representation of a list of paths
        try:
            # Remove brackets and split by comma
            paths = output.strip('[]').replace("'", "").split(',')
            paths = [p.strip() for p in paths if p.strip()]  # Clean up whitespace and empty strings
            
            # Generate URLs for separated speakers using the actual paths
            speaker_urls = [
                {
                    "speaker": f"Speaker {i+1}", 
                    "file_url": f"/download/{os.path.basename(path)}"
                }
                for i, path in enumerate(paths)
            ]

            return JSONResponse(content={
                "message": "Speech separation successful", 
                "speakers": speaker_urls,
                "paths": paths  # Optional: include full paths for debugging
            })

        except Exception as e:
            print(f"Error parsing output paths: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse separated audio paths")

    except Exception as e:
        print("Error in speech separation:", str(e))
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        # Clean up the temporary input file
        if os.path.exists(audio_path):
            os.remove(audio_path)









@app.post("/merge_audio/")
async def merge_audio(files: List[UploadFile] = File(...)):
    try:
        # Create a temporary directory for processing
        temp_dir = "temp_merge"
        os.makedirs(temp_dir, exist_ok=True)

        # Save uploaded files temporarily
        temp_files = []
        for file in files:
            temp_path = os.path.join(temp_dir, file.filename)
            with open(temp_path, "wb") as temp_file:
                temp_file.write(await file.read())
            temp_files.append(temp_path)

        # Load the first audio file
        combined = AudioSegment.from_wav(temp_files[0])

        # Overlay subsequent files
        for file_path in temp_files[1:]:
            audio = AudioSegment.from_wav(file_path)
            combined = combined.overlay(audio)

        # Save the merged file
        output_path = os.path.join(OUTPUT_DIR, "merged_output.wav")
        combined.export(output_path, format="wav")

        # Clean up temp files
        for file_path in temp_files:
            os.remove(file_path)
        os.rmdir(temp_dir)

        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename="merged_output.wav"
        )

    except Exception as e:
        print("Error merging audio:", str(e))
        raise HTTPException(status_code=500, detail=f"Error merging audio: {str(e)}")
