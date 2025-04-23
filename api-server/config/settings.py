 
"""
Application settings module.

This module imports settings from the infrastructure layer and can provide 
additional environment-specific configuration logic if needed. 

For most cases, you should import get_settings from this module rather than
directly from the infrastructure layer.
"""

import os
from app.infrastructure.config_manager import get_settings, Settings

# Re-export the get_settings function
__all__ = ['get_settings']

# Environment-specific configuration
def configure_environment():
    """
    Apply environment-specific configuration.
    
    This function is called during application startup and can modify
    settings based on the current environment (dev, test, prod).
    """
    env = os.getenv("APP_ENV", "development")
    settings = get_settings()
    
    if env == "production":
        # Production-specific settings
        pass
    
    elif env == "development":
        # Testing-specific settings
        settings.UPLOAD_DIR = "test_uploads"
    
    # You can add more environment-specific configurations here

# Initialize any dynamic settings
def init_settings():
    """
    Initialize any settings that need to be set up dynamically.
    """
    # Create necessary directories
    os.makedirs(get_settings().UPLOAD_DIR, exist_ok=True)
    os.makedirs(get_settings().MODELS_DIR, exist_ok=True)