import pickle

ENCODER_PATH = "label_encoder.pkl"

try:
    with open(ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)
    print("Label encoder loaded successfully!")
except Exception as e:
    print(f"Error loading label encoder: {e}")
