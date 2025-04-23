import logging
import os
import torch
from tensorflow.keras.models import load_model as load_keras_model
from ..exceptions.custom_exceptions import ModelLoadingError

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Service for loading and managing ML models.
    """
    
    def __init__(self, models_dir: str = None):
        """
        Initialize the model manager.
        
        Args:
            models_dir: Directory containing model files (default from settings)
        """
        from .config_manager import get_settings
        
        self.settings = get_settings()
        self.models_dir = models_dir or self.settings.MODELS_DIR
        self.model_cache = {}  # Cache for loaded models
        
        logger.info(f"ModelManager initialized with models directory: {self.models_dir}")
    
    async def get_model(self, model_name: str):
        """
        Load and return a Keras model.
        
        Args:
            model_name: Name of the model file
            
        Returns:
            Loaded model instance
            
        Raises:
            ModelLoadingError: If model loading fails
        """
        # Check cache first
        if model_name in self.model_cache:
            logger.debug(f"Using cached model: {model_name}")
            return self.model_cache[model_name]
        
        # Build model path
        model_path = os.path.join(self.models_dir, model_name)
        
        try:
            # Validate model path
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load the model
            logger.info(f"Loading Keras model: {model_name}")
            model = load_keras_model(model_path)
            
            # Cache the model
            self.model_cache[model_name] = model
            
            return model
            
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            raise ModelLoadingError(model_name, str(e))
    
    async def get_pytorch_model(self, model_name: str, device=None):
        """
        Load and return a PyTorch model.
        
        Args:
            model_name: Name of the model file
            device: Target device (CPU/GPU)
            
        Returns:
            Loaded PyTorch model instance
            
        Raises:
            ModelLoadingError: If model loading fails
        """
        # Check cache first
        cache_key = f"pytorch_{model_name}"
        if cache_key in self.model_cache:
            logger.debug(f"Using cached PyTorch model: {model_name}")
            return self.model_cache[cache_key]
        
        # Build model path
        model_path = os.path.join(self.models_dir, model_name)
        
        try:
            # Validate model path
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Determine the device
            if device is None:
                device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
            
            # Load the model
            logger.info(f"Loading PyTorch model: {model_name} (device: {device})")
            
            if torch.cuda.is_available() and str(device).startswith('cuda'):
                model = torch.load(model_path, weights_only=False)
            else:
                model = torch.load(model_path, map_location=device, weights_only=False)
            
            # Set model to evaluation mode
            model.eval()
            model = model.to(device)
            
            # Cache the model
            self.model_cache[cache_key] = model
            
            return model
            
        except Exception as e:
            logger.error(f"Error loading PyTorch model {model_name}: {str(e)}")
            raise ModelLoadingError(model_name, str(e))
    
    def clear_cache(self):
        """Clear the model cache to free memory."""
        self.model_cache.clear()
        logger.info("Model cache cleared")