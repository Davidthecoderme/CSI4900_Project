import logging
import os
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from ..infrastructure.model_manager import ModelManager
from ..exceptions.custom_exceptions import SegmentationError, ModelLoadingError

logger = logging.getLogger(__name__)

class LesionSegmenter:
    """
    Component for segmenting skin lesions in images.
    Based on the unet_segmentation.py implementation.
    """
    
    # Constants
    IMAGE_SIZE = (224, 224)
    MODEL_NAME = "unet_segmentation.h5"
    
    def __init__(self, model_manager: ModelManager):
        """
        Initialize the lesion segmenter with model manager.
        
        Args:
            model_manager: Service for loading and managing ML models
        """
        self.model_manager = model_manager
        logger.info("LesionSegmenter initialized")
    
    async def segment(self, image_path: str) -> str:
        """
        Segment a skin lesion in an image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            str: Base64 encoded segmentation mask image
            
        Raises:
            SegmentationError: If segmentation fails
            ModelLoadingError: If the model fails to load
        """
        try:
            # Validate image path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Load and preprocess image
            img = self._load_image(image_path)
            processed_img = self._preprocess_image(img)
            
            # Load model and predict
            model = await self.model_manager.get_model(self.MODEL_NAME)
            if model is None:
                raise ModelLoadingError(self.MODEL_NAME)
                
            # Predict mask
            mask = self._predict_mask(processed_img, model)
            
            # Convert mask to base64
            base64_mask = self._mask_to_base64(mask)
            
            logger.info("Lesion segmentation completed successfully")
            return base64_mask
            
        except FileNotFoundError as e:
            logger.error(f"File error in lesion segmentation: {str(e)}")
            raise SegmentationError(f"File error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in lesion segmentation: {str(e)}")
            raise SegmentationError(f"Segmentation error: {str(e)}")
    
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
        Preprocess image for model input.
        
        Args:
            img: Input image
            
        Returns:
            np.ndarray: Preprocessed image ready for model input
        """
        img = cv2.resize(img, self.IMAGE_SIZE)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # No normalization as per original implementation
        return img

    def _predict_mask(self, img: np.ndarray, model) -> np.ndarray:
        """
        Predict segmentation mask using the model.
        
        Args:
            img: Preprocessed input image
            model: Loaded segmentation model
            
        Returns:
            np.ndarray: Binary segmentation mask
        """
        # Use reshape exactly as in the original implementation
        pred = model.predict(img.reshape(1, 224, 224, 3))
        
        # Threshold prediction
        mask = (pred[0] > 0.5).astype(np.uint8)
        
        # Add debug logging
        logger.info(f"Mask shape: {mask.shape}, Min: {mask.min()}, Max: {mask.max()}, Mean: {mask.mean()}")
        
        return mask

    def _mask_to_base64(self, mask: np.ndarray) -> str:
        """
        Convert a segmentation mask to base64 encoded image.
        
        Args:
            mask: Binary segmentation mask
            
        Returns:
            str: Base64 encoded image with data URI prefix
        """
        # Convert to PIL Image - multiply by 255 to convert binary mask to visible image
        result_img = Image.fromarray((mask.squeeze() * 255).astype(np.uint8))
        
        # Convert to base64
        buffered = BytesIO()
        result_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        img_str = 'data:image/png;base64,' + img_str
        
        return img_str