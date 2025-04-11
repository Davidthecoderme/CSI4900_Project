#!/usr/bin/env python3
"""
Skin Disease Image Classifier - Command Line Tool
Usage: python skin_classifier.py <image_path> [--threshold THRESHOLD]
"""

import os
import argparse
import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Constants
MODEL_PATH = "skin_vs_non_skin.h5"
IMAGE_SIZE = (224, 224)

def load_image(image_path):
    """Load and validate an image file."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image (may be corrupt or unsupported format): {image_path}")
    
    if img.size == 0:
        raise ValueError("Loaded image is empty")
    
    return img

def preprocess_image(img):
    """Prepare image for model prediction."""
    img = cv2.resize(img, IMAGE_SIZE)
    img = img / 255.0  # Normalize
    return np.expand_dims(img, axis=0)

def classify_skin(image_path, threshold=0.2):
    """Classify if an image contains skin content."""
    try:
        # Load and validate image
        img = load_image(image_path)
        
        # Preprocess
        processed_img = preprocess_image(img)
        
        # Load model and predict
        model = load_model(MODEL_PATH)
        prediction = model.predict(processed_img)[0][0]
        
        return prediction > threshold, float(prediction)
    
    except Exception as e:
        return False, 0.0, str(e)

def main():
    # Set up command line arguments
    parser = argparse.ArgumentParser(description="Classify if an image contains skin content")
    parser.add_argument("image_path", help="Path to the image file")
    parser.add_argument("--threshold", type=float, default=0.2,
                       help="Classification threshold (default: 0.5)")
    args = parser.parse_args()
    try:
        is_skin, confidence = classify_skin(args.image_path, args.threshold)
    except:
        print(f"Error")


    
    result = "SKIN" if is_skin else "NON-SKIN"
    print(f"Result: {result} (Confidence: {confidence:.2%})")
    if result == "SKIN":
        return 1
    else:
        return 0
    

if __name__ == "__main__":
    import sys
    sys.exit(main())