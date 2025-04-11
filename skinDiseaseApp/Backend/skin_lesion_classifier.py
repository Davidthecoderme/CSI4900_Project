#!/usr/bin/env python3
"""
Skin Lesion Classification Tool

This script loads a PyTorch CNN model trained on the HAM10000 dataset
and uses it to classify skin lesion images into 7 different categories.

Usage:
    python skin_lesion_classifier.py --image test_image.jpg [--visualize]
"""

import argparse
import os
import torch
from PIL import Image
import torchvision.transforms as transforms
import torch.nn.functional as F
import matplotlib.pyplot as plt
from torchvision.models import mobilenet_v2  # Import this for safe loading

# Hardcoded model path - modify this to match your model's location
MODEL_PATH = "complete_model.pth"

def classify_skin_lesion(image_path):
    """
    Classify a skin lesion image using a PyTorch CNN model.
    
    Args:
        image_path (str): Path to the image file
    
    Returns:
        tuple: (label, name, probability, top3_results)
    """
    # Define class labels and their human-readable names
    class_labels = ['akiec', 'bcc', 'bkl', 'df', 'nv', 'vasc', 'mel']
    class_names = {
        'nv': 'Melanocytic nevi',
        'mel': 'Melanoma',
        'bkl': 'Benign keratosis-like lesions',
        'bcc': 'Basal cell carcinoma',
        'akiec': 'Actinic keratoses',
        'vasc': 'Vascular lesions',
        'df': 'Dermatofibroma'
    }
    
    # Check if files exist
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Load the model with proper device handling and explicitly set weights_only=False
    try:
        if torch.cuda.is_available():
            # Modified to allow full model loading
            model = torch.load(MODEL_PATH, weights_only=False)
        else:
            # Modified to allow full model loading on CPU
            model = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
        model.eval()  # Set model to evaluation mode
    except Exception as e:
        raise RuntimeError(f"Error loading model: {e}")
    
    # Set device (GPU or CPU)
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    model = model.to(device)
    
    # Define image transformations based on the training procedure
    # These values match those used in the notebook
    NORM_MEAN = [0.7630392, 0.5456477, 0.57004845]  # RGB channels
    NORM_STD = [0.1409286, 0.15261266, 0.16997074]  # RGB channels
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(NORM_MEAN, NORM_STD)
    ])
    
    # Load and preprocess the image
    try:
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)  # Add batch dimension
    except Exception as e:
        raise RuntimeError(f"Error loading or processing image: {e}")
    
    # Run inference
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)[0]
        predicted_class = torch.argmax(outputs, dim=1).item()
    
    # Get the class label and name
    label = class_labels[predicted_class]
    name = class_names[label]
    probability = probabilities[predicted_class].item() * 100
    
    # Get top 3 predictions
    top3_results = []
    top3_probs, top3_indices = torch.topk(probabilities, 3)
    for i in range(3):
        idx = top3_indices[i].item()
        prob = top3_probs[i].item() * 100
        top3_results.append((class_labels[idx], class_names[class_labels[idx]], prob))
    
    return label, name, probability, top3_results

def visualize_prediction(image_path, label, name, probability, top3_results=None):
    """
    Visualize the image with its prediction.
    """
    image = Image.open(image_path).convert('RGB')
    
    plt.figure(figsize=(10, 8))
    plt.imshow(image)
    plt.axis('off')
    
    # Main prediction
    title = f"Prediction: {name} ({label})\nConfidence: {probability:.2f}%"
    plt.title(title, fontsize=14)
    
    # Add top 3 predictions if provided
    if top3_results:
        y_offset = 0.02
        for i, (label, name, prob) in enumerate(top3_results):
            plt.figtext(0.02, y_offset, f"{i+1}. {name} ({label}): {prob:.2f}%", 
                       bbox=dict(facecolor='white', alpha=0.8))
            y_offset += 0.04
    
    plt.tight_layout()
    plt.show()

def main():
    """Main function for command-line use."""
    parser = argparse.ArgumentParser(description='Classify a skin lesion image using a PyTorch CNN model')
    parser.add_argument('--image', type=str, required=True, help='Path to the image file')
    parser.add_argument('--visualize', action='store_true', help='Show the image with prediction')
    args = parser.parse_args()
    
    try:
        print(f"Using model: {MODEL_PATH}")
        
        # Classify the image
        label, name, probability, top3_results = classify_skin_lesion(args.image)
        
        # Print results
        print(f"\nPrediction: {name} ({label})")
        print(f"Confidence: {probability:.2f}%")
        
        print("\nTop 3 predictions:")
        for i, (label, name, prob) in enumerate(top3_results):
            print(f"{i+1}. {name} ({label}): {prob:.2f}%")
        
        # Visualize if requested
        if args.visualize:
            visualize_prediction(args.image, label, name, probability, top3_results)
    
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()