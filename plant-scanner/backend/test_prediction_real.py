import sys
import os
import json

IMAGE_PATH = "sample_plant.jpg"
API_URL = "http://127.0.0.1:8000/predict-image"

def predict_image():
    global IMAGE_PATH
    if len(sys.argv) > 1:
        IMAGE_PATH = sys.argv[1]

    if not os.path.exists(IMAGE_PATH):
        print(f"Error: {IMAGE_PATH} not found.")
        return

    print(f"Sending request to {API_URL} with image: {IMAGE_PATH}...")
    try:
        import requests
    except ImportError:
        print("Requests library not found. Installing...")
        install("requests")
        import requests

    try:
        with open(IMAGE_PATH, 'rb') as f:
            files = {'file': f}
            response = requests.post(API_URL, files=files)
        
        print(f"Status Code: {response.status_code}")
        try:
            result = response.json()
            with open("prediction_result.txt", "w") as f:
                if "debug" in result:
                    f.write(f"Tensor Stats: Min={result['debug']['tensor_min']:.3f}, Max={result['debug']['tensor_max']:.3f}, Mean={result['debug']['tensor_mean']:.3f}\n")
                if "predictions" in result:
                    f.write("Top 5 Predictions:\n")
                    for pred in result["predictions"]:
                        f.write(f"{pred['class']}: {pred['confidence']:.4f}\n")
                else:
                    f.write(f"Response: {json.dumps(result, indent=2)}\n")
            print("Result written to prediction_result.txt")
        except:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Failed to predict: {e}")

if __name__ == "__main__":
    predict_image()
