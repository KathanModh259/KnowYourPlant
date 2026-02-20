import sys
import os
import torch

# Ensure we can import app
sys.path.append(os.getcwd())

try:
    from app.model import get_model, CLASS_NAMES
except ImportError as e:
    print(f"ImportError: {e}")
    print("Make sure you are running this script from 'backend' directory.")
    sys.exit(1)

def test_model():
    print("Loading model...")
    try:
        model = get_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
        sys.exit(1)
        
    print("Model loaded successfully.")
    print(f"Number of classes: {len(CLASS_NAMES)}")
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Run inference
    with torch.no_grad():
        output = model(dummy_input)
    
    print(f"Output shape: {output.shape}")
    
    if output.shape == (1, 38):
        print("Test passed: Output shape is correct.")
    else:
        print(f"Test failed: Expected (1, 38), got {output.shape}")
        sys.exit(1)

if __name__ == "__main__":
    test_model()
