import speech_recognition as sr
import librosa
import numpy as np
from transformers import BertTokenizer, TFBertModel
import tensorflow as tf
from tensorflow.keras.models import load_model
import joblib
import sys
import os


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

def predict_emotion(audio_file):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # directory of the current script

    audio_model_path = os.path.join(BASE_DIR, "audio_emotion_model.pkl")
    text_model_path = os.path.join(BASE_DIR, "text_emotion_model.keras")
    audio_label_path = os.path.join(BASE_DIR, "audio_label_encoder.pkl")
    text_label_path = os.path.join(BASE_DIR, "text_label_encoder.pkl")

    # Load the models
    audio_model = joblib.load(audio_model_path)
    text_model = tf.keras.models.load_model(text_model_path)

    # Load label encoders
    with open(audio_label_path, 'rb') as f:
        label_encoder_audio = joblib.load(f)
    with open(text_label_path, 'rb') as f:
        label_encoder_text = joblib.load(f)


    # Transcribe the audio
    transcription = transcribe_audio(audio_file)
        
    # Extract audio features
    audio_features = extract_audio_features(audio_file).reshape(1, -1)
    audio_prediction = audio_model.predict(audio_features)

    # Extract text features
    text_features = extract_text_features(transcription)
    text_prediction = text_model.predict(text_features)

    # Predict separately
    audio_pred_class = audio_model.predict(audio_features)  # shape (1,), already class label
    text_pred_class = np.argmax(text_prediction, axis=1)    # shape (1,), softmax output


    # Decode predictions
    audio_emotion = label_encoder_audio.inverse_transform(audio_pred_class)[0]
    text_emotion = label_encoder_text.inverse_transform(text_pred_class)[0]

    # Final decision
    if audio_emotion == text_emotion:
        return audio_emotion
    else:
        return f"{audio_emotion} or {text_emotion}"



if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python emotion-detection.py <original_audio_path>")
        sys.exit(1)

    original_audio_path = sys.argv[1]
    result = predict_emotion(original_audio_path)
    print(result.upper())