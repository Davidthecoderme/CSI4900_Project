import logging
import os
import torch
from PIL import Image
import torchvision.transforms as transforms
import torch.nn.functional as F
from typing import Dict, List
from ..infrastructure.model_manager import ModelManager
from ..exceptions.custom_exceptions import ClassificationError, ModelLoadingError

logger = logging.getLogger(__name__)

class LesionClassifier:
    """
    Component for classifying skin lesions.
    Based on the skin_lesion_classifier.py implementation.
    """

    # Constants
    MODEL_NAME = "EfficientNetV2Large_ham10000.pth"  # Updated model name
    NORM_MEAN = [0.485, 0.456, 0.406]  #  normalization values (ImageNet)
    NORM_STD = [0.229, 0.224, 0.225]  #  normalization values (ImageNet)

    # Class labels and names (These remain the same if your training setup is consistent)
    CLASS_LABELS = ['akiec', 'bcc', 'bkl', 'df', 'nv', 'vasc', 'mel']
    CLASS_NAMES = {
        'nv': 'Melanocytic nevi',
        'mel': 'Melanoma',
        'bkl': 'Benign keratosis-like lesions',
        'bcc': 'Basal cell carcinoma',
        'akiec': 'Actinic keratoses',
        'vasc': 'Vascular lesions',
        'df': 'Dermatofibroma'
    }

    def __init__(self, model_manager: ModelManager):
        """
        Initialize the lesion classifier with model manager.

        Args:
            model_manager: Service for loading and managing ML models
        """
        self.model_manager = model_manager
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        logger.info(f"LesionClassifier initialized (using device: {self.device})")

    async def classify(self, image_path: str) -> Dict:
        """
        Classify a skin lesion image.

        Args:
            image_path: Path to the image file

        Returns:
            Dict: Classification result with prediction and top3

        Raises:
            ClassificationError: If classification fails
        """
        try:
            # Validate image path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")

            # Load model
            model = await self.model_manager.get_pytorch_model(self.MODEL_NAME, self.device)
            if model is None:
                raise ModelLoadingError(self.MODEL_NAME)

            # Define transformations
            transform = transforms.Compose([
                transforms.Resize((480, 480)),  # Updated resize value (EfficientNetV2-Large)
                transforms.ToTensor(),
                transforms.Normalize(self.NORM_MEAN, self.NORM_STD)  # Updated normalization
            ])

            # Load and preprocess the image
            image = Image.open(image_path).convert('RGB')
            image_tensor = transform(image).unsqueeze(0).to(self.device)  # Add batch dimension

            # Run inference
            with torch.no_grad():
                outputs = model(image_tensor)
                probabilities = F.softmax(outputs, dim=1)[0]
                predicted_class = torch.argmax(outputs, dim=1).item()

            # Get the class label and name
            label = self.CLASS_LABELS[predicted_class]
            name = self.CLASS_NAMES[label]
            probability = probabilities[predicted_class].item() * 100

            # Get top 3 predictions
            top3_probs, top3_indices = torch.topk(probabilities, 3)

            # Create top3 list in the required format
            top3_list = []
            for i in range(3):
                idx = top3_indices[i].item()
                prob = top3_probs[i].item() * 100
                current_label = self.CLASS_LABELS[idx]
                current_name = self.CLASS_NAMES[current_label]
                top3_list.append({
                    "label": current_label,
                    "name": current_name,
                    "probability": f"{prob:.2f}%"
                })

            # Format result as the expected structure
            result = {
                "prediction": {
                    "label": label,
                    "name": name,
                    "probability": f"{probability:.2f}%"
                },
                "top3": top3_list
            }

            logger.info(f"Lesion classified as: {name} with {probability:.2f}% confidence")
            return result

        except FileNotFoundError as e:
            logger.error(f"File error in lesion classification: {str(e)}")
            raise ClassificationError(f"File error: {str(e)}")

        except Exception as e:
            logger.error(f"Error in lesion classification: {str(e)}")
            raise ClassificationError(f"Classification error: {str(e)}")