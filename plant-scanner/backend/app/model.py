import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import io
import torch.nn as nn
from fastapi import UploadFile

# PlantVillage Classes
CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

def get_model():
    model = models.resnet18(weights=None) # weights=None is safer than pretrained=False in newer torchvision
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(CLASS_NAMES))
    # Load state dict
    # Assuming running from parent directory of app (backend/)
    import os
    model_path = 'plantvillage_resnet18_best.pth'
    if not os.path.exists(model_path):
        # Fallback if running from within app or elsewhere, though usually CWD is backend
        if os.path.exists('../plantvillage_resnet18_best.pth'):
             model_path = '../plantvillage_resnet18_best.pth'
    
    # Load correctly
    try:
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    except Exception as e:
        print(f"Error loading model: {e}")
        # Return model anyway to allow app to start, but it will fail on inference or we can raise
        raise e
        
    model.eval()
    return model

# Global model instance
try:
    model = get_model()
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

async def predict_image(file: UploadFile):
    if model is None:
        return {"error": "Model not loaded"}
        
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    image = transform(image).unsqueeze(0)
    print(f"Input Tensor Stats - Min: {image.min().item():.3f}, Max: {image.max().item():.3f}, Mean: {image.mean().item():.3f}")
    
    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_idxs = torch.topk(probabilities, 5)
        
        predictions = []
        for i in range(5):
            predictions.append({
                "class": CLASS_NAMES[top_idxs[0][i].item()],
                "confidence": float(top_probs[0][i].item())
            })
        
    return {
        "predictions": predictions,
        "debug": {
            "tensor_min": float(image.min().item()),
            "tensor_max": float(image.max().item()),
            "tensor_mean": float(image.mean().item())
        }
    }
