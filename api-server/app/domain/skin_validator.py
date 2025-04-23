import logging
import os
import cv2
import numpy as np
from ..infrastructure.model_manager import ModelManager
from ..exceptions.custom_exceptions import NotSkinImageError, ModelLoadingError

logger = logging.getLogger(__name__)

class SkinValidator:
    """
    Component for validating if an image contains skin.
    Based on the skin_nonskin_classifier.py implementation.
    """
    
    # Constants
    IMAGE_SIZE = (224, 224)
    MODEL_NAME = "skin_vs_non_skin.h5"
    
    def __init__(self, model_manager: ModelManager):
        """
        Initialize the skin validator with model manager.
        
        Args:
            model_manager: Service for loading and managing ML models
        """
        self.model_manager = model_manager
        logger.info("SkinValidator initialized")
    
    async def validate(self, image_path: str, threshold: float = 0.2) -> tuple:
        """
        Validate if an image contains skin content.
        
        Args:
            image_path: Path to the image file
            threshold: Classification threshold (default: 0.2)
            
        Returns:
            tuple: (is_skin, confidence)
                is_skin (bool): True if image contains skin
                confidence (float): Confidence score (0-1)
                
        Raises:
            NotSkinImageError: If the image doesn't contain skin
            ModelLoadingError: If the model fails to load
        """
        try:
            # Validate image path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Load and validate image
            img = self._load_image(image_path)
            
            # Preprocess
            processed_img = self._preprocess_image(img)
            
            # Load model and predict
            model = await self.model_manager.get_model(self.MODEL_NAME)
            if model is None:
                raise ModelLoadingError(self.MODEL_NAME)
                
            prediction = model.predict(processed_img)[0][0]
            is_skin = prediction > threshold
            
            logger.info(f"Skin validation result: {'SKIN' if is_skin else 'NON-SKIN'} "
                       f"(Confidence: {prediction:.2%})")
            
            return is_skin, float(prediction)
            
        except FileNotFoundError as e:
            logger.error(f"File error in skin validation: {str(e)}")
            raise NotSkinImageError(f"File error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in skin validation: {str(e)}")
            raise NotSkinImageError(f"Validation error: {str(e)}")
    
    def _load_image(self, image_path: str) -> np.ndarray:
        """
        Load and validate an image file.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            np.ndarray: Loaded image
            
        Raises:
            ValueError: If the image is corrupt or empty
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image (may be corrupt or unsupported format): {image_path}")
        
        if img.size == 0:
            raise ValueError("Loaded image is empty")
        
        return img
    
    def _preprocess_image(self, img: np.ndarray) -> np.ndarray:
        """
        Prepare image for model prediction.
        
        Args:
            img: Input image
            
        Returns:
            np.ndarray: Preprocessed image ready for model input
        """
        img = cv2.resize(img, self.IMAGE_SIZE)
        img = img / 255.0  # Normalize
        return np.expand_dims(img, axis=0)