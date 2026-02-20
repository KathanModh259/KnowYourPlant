import urllib.request
import urllib.error
import ssl
import sys
import os

# Apple Scab image from PlantVillage (via some reliable URL or Wikimedia)
# Wikimedia: https://commons.wikimedia.org/wiki/File:Apple_Scab_on_Leaf.jpg
IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Apple_Scab_on_Leaf.jpg/640px-Apple_Scab_on_Leaf.jpg"
IMAGE_PATH = "sample_apple_scab.jpg"
API_URL = "http://127.0.0.1:8000/predict-image"

def download_image():
    print(f"Downloading image from {IMAGE_URL}...")
    try:
        context = ssl._create_unverified_context()
        req = urllib.request.Request(IMAGE_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=context) as response, open(IMAGE_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Image saved to {IMAGE_PATH}")
    except Exception as e:
        print(f"Failed to download image: {e}")
        # Create dummy if fail, but that won't help verification
        sys.exit(1)

if __name__ == "__main__":
    download_image()
    # Now run prediction using the existing script logic (or call it)
    import subprocess
    subprocess.call([sys.executable, "test_prediction_real.py", IMAGE_PATH])
