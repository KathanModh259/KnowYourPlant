import sys
import os
import json
import requests

IMAGE_PATH = "test_image.jpg"
API_URL = "http://127.0.0.1:8000/predict-image"

def predict_image():
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
    else:
        img_path = IMAGE_PATH

    print(f"Testing {img_path}...")
    try:
        with open(img_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(API_URL, files=files)
        
        result = response.json()
        print(f"Top prediction: {result['predictions'][0]['class']}")
        # Dump full result to file
        with open("full_prediction.json", "w") as f:
            json.dump(result, f, indent=2)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    predict_image()
