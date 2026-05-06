from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf
import io
import os
import pickle
from keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware
import subprocess  # Import subprocess for running Speech-Separation.py
from fastapi import APIRouter  # Import APIRouter to organize routes
import joblib  # Import joblib for loading models
import speech_recognition as sr
import librosa
import numpy as np
from transformers import BertTokenizer, TFBertModel
import tensorflow as tf
from tensorflow.keras.models import load_model


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
    
    


# Load the BERT tokenizer and model for text processing
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = TFBertModel.from_pretrained('bert-base-uncased')

# Function to transcribe audio to text
def transcribe_audio(audio_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)
    try:
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return ""
    except sr.RequestError:
        return ""

# Function to extract audio features
def extract_audio_features(file_path):
    signal, sr = librosa.load(file_path, sr=22050)

    # Extract MFCC
    mfccs = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=13)
    mfccs_scaled = np.mean(mfccs.T, axis=0)

    # Extract Chroma
    chroma = librosa.feature.chroma_stft(y=signal, sr=sr)
    chroma_scaled = np.mean(chroma.T, axis=0)

    # Extract Spectral Contrast
    spectral_contrast = librosa.feature.spectral_contrast(y=signal, sr=sr)
    spectral_contrast_scaled = np.mean(spectral_contrast.T, axis=0)

    # Extract Zero-Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y=signal)
    zcr_scaled = np.mean(zcr.T, axis=0)

    return np.concatenate([mfccs_scaled, chroma_scaled, spectral_contrast_scaled, zcr_scaled])

# Function to extract text features using BERT
def extract_text_features(text):
    inputs = tokenizer(text, return_tensors='tf', padding=True, truncation=True, max_length=64)
    outputs = bert_model(**inputs)
    pooled = tf.reduce_mean(outputs.last_hidden_state, axis=1)  # Mean pooling
    return pooled.numpy()

def predict_emotion_sentiment(audio_file):
    # Load the models
    audio_model = joblib.load("emotion-detection/audio_emotion_model.pkl")
    text_model = load_model('emotion-detection/text_emotion_model.keras')


    # Transcribe the audio
    transcription = transcribe_audio(audio_file)
    if transcription == "":
        print("Error: Could not transcribe audio.")
    else:
      print("Transcribed Audio: ", transcription, "\n\n")

    # Extract audio features
    audio_features = extract_audio_features(audio_file).reshape(1, -1)
    audio_prediction = audio_model.predict(audio_features)

    # Extract text features
    text_features = extract_text_features(transcription)
    text_prediction = text_model.predict(text_features)

    # Predict separately
    audio_pred_class = audio_model.predict(audio_features)  # shape (1,), already class label
    text_pred_class = np.argmax(text_prediction, axis=1)    # shape (1,), softmax output


    # Load label encoders
    with open('emotion-detection/audio_label_encoder.pkl', 'rb') as f:
        label_encoder_audio = joblib.load(f)

    with open('emotion-detection/text_label_encoder.pkl', 'rb') as f:
        label_encoder_text = joblib.load(f)

    # Decode predictions
    audio_emotion = label_encoder_audio.inverse_transform(audio_pred_class)[0]
    text_emotion = label_encoder_text.inverse_transform(text_pred_class)[0]

    # Final decision
    if audio_emotion == text_emotion:
        return audio_emotion
    else:
        return f"{audio_emotion} or {text_emotion}"


# API to predict emotion from audio
@app.post("/predict_emotion/")
async def predict_emotion(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as temp_file:
            temp_file.write(await file.read())

        
        predicted_emotion = predict_emotion_sentiment(temp_path)
        if predicted_emotion is None:
            raise HTTPException(status_code=500, detail="Failed to predict emotion")    

        os.remove(temp_path)  # Clean up temp file

        return JSONResponse(content={"emotion": predicted_emotion})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# Define the separated speakers folder
SPEAKER_DIR = "separated_speakers"

# Ensure the folder exists
os.makedirs(SPEAKER_DIR, exist_ok=True)

# API for speech separation
@app.post("/separate_speakers/")
async def separate_speakers(file: UploadFile = File(...)):
    try:
        # Save uploaded file as "test.wav"
        audio_path = "test.wav"
        with open(audio_path, "wb") as audio_file:
            audio_file.write(await file.read())

        # Run Speech-Separation.py script
        print("Running Speech-Separation.py...")
        result = subprocess.run(["python", "Speech-Separation.py"], capture_output=True, text=True)
        print("Speech separation script output:", result.stdout)

        # Check if speaker files exist
        if not os.path.exists(SPEAKER_DIR) or not os.listdir(SPEAKER_DIR):
            raise HTTPException(status_code=500, detail="Speaker separation failed!")

        # Generate URLs for separated speakers
        speaker_files = sorted(os.listdir(SPEAKER_DIR))  # Sort files for consistency

        speaker_urls = [
            {"speaker": f"Speaker {i+1}", "file_url": f"/download/{filename}"}
            for i, filename in enumerate(speaker_files)
        ]

        return JSONResponse(content={"message": "Speech separation successful", "speakers": speaker_urls})

    except Exception as e:
        print("Error in speech separation:", str(e))
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# API to download separated speaker files
@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(SPEAKER_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/wav", filename=filename)
