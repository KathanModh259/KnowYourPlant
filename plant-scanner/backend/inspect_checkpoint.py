import torch
import sys

MODEL_PATH = 'plantvillage_resnet18_best.pth'

def inspect_checkpoint():
    try:
        data = torch.load(MODEL_PATH, map_location='cpu')
        print(f"Type of checkpoint: {type(data)}")
        if isinstance(data, dict):
            print(f"Keys: {list(data.keys())}")
            if 'class_to_idx' in data:
                print("Found class_to_idx!")
                print(data['class_to_idx'])
            elif 'classes' in data:
                 print("Found classes!")
                 print(data['classes'])
        else:
            print("Checkpoint is not a dictionary (likely just state_dict).")
            
    except Exception as e:
        print(f"Error loading checkpoint: {e}")

if __name__ == "__main__":
    inspect_checkpoint()
