import cv2
import numpy as np
import os
import argparse
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
import base64
from io import BytesIO
from PIL import Image

# Constants
MODEL_PATH = "unet_segmentation.h5"
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
    """Preprocess image for model input."""
    img = cv2.resize(img, IMAGE_SIZE)  # OpenCV uses (width, height)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
    # img = img.astype(np.float32) / 255.0  # Normalize to [0,1]
    return img

def predict_mask(img, model):
    """Predict segmentation mask using the model."""
    # Add batch dimension
    # img_input = np.expand_dims(img, axis=0)
    # Predict
    pred = model.predict(img.reshape(1,224,224,3))
    # Threshold prediction
    # pred = cv2.resize(pred, (224, 224))
    mask = (pred[0] > 0.5).astype(np.uint8)
    return mask
    

def main():
    # Set up command line arguments
    parser = argparse.ArgumentParser(description="UNET image segmentation")
    parser.add_argument("image_path", help="Path to the image file")
    args = parser.parse_args()

    try:
        # img = cv2.imread(args.image_path)
        # img = cv2.resize(img, (256, 192))  # Resize to match model input size
        # print(img.shape)        
        # img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
        # model22 = load_model(MODEL_PATH)
        # mask = model22.predict(img.reshape(1,192,256,3))

        # Load and preprocess image
        img = load_image(args.image_path)
        processed_img = preprocess_image(img)
        
        # Load model and predict
        model = load_model(MODEL_PATH)
        mask = predict_mask(processed_img, model)
        # Convert to PIL Image
        result_img = Image.fromarray((mask.squeeze() * 255).astype(np.uint8))
        
        # Convert to base64
        buffered = BytesIO()
        result_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        img_str = 'data:image/png;base64,' + img_str
        # print(img_str)

        # return jsonify({
        #     'processedImage': img_str
        # })
    
        print(img_str)  # This will be captured by stdout
        
        # # Display results
        # plt.figure(figsize=(16, 8))
        # plt.subplot(1, 2, 1)
        # plt.imshow(processed_img)
        # plt.title('Original Image')
        # plt.axis('off')
        
        # plt.subplot(1, 2, 2)
        # plt.imshow(mask.squeeze(), cmap='binary_r')  # Remove single-dimensional entries
        # plt.title('Predicted Segmentation')
        # plt.axis('off')
        
        # plt.tight_layout()
        # plt.show()
        

        
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1  # Error

if __name__ == "__main__":
    import sys
    sys.exit(main())
