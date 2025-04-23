import os
import logging
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # API Settings
    API_TITLE: str = "Skin Lesion Detection API"
    API_DESCRIPTION: str = "API for skin lesion detection and health assistant"
    API_VERSION: str = "1.0.0"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])
    
    # File Storage
    UPLOAD_DIR: str = Field(default="temp_uploads")
    
    # Model Settings
    MODELS_DIR: str = Field(default="models")
    
    # Gemini AI Settings
    GEMINI_API_KEY: str = Field(default=None)
    GEMINI_MODEL_NAME: str = Field(default="gemini-1.5-pro")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    
    # Environment
    APP_ENV: str = Field(default="development")  # Add this line
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Optional: allows extra fields without errors

@lru_cache
def get_settings() -> Settings:
    """
    Get application settings (cached for efficiency).
    
    Returns:
        Settings: Application settings instance
    """
    logger.debug("Loading application settings")
    return Settings()

def configure_logging():
    """
    Configure application logging based on settings.
    """
    settings = get_settings()
    
    # Set up basic logging configuration
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )
    
    # Reduce verbosity of some loggers
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("tensorflow").setLevel(logging.WARNING)
    
    logger.debug("Logging configured")