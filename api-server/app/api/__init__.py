from fastapi import FastAPI
from .routes import router
from .middlewares import setup_middlewares
import logging

logger = logging.getLogger(__name__)

def init_api() -> FastAPI:
    """
    Initialize the FastAPI application with routes and middlewares.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title="Skin Lesion Detection API",
        description="API for skin lesion detection and health assistant",
        version="1.0.0",
    )
    
    # Setup middlewares
    setup_middlewares(app)
    
    # Include router
    app.include_router(router)
    
    logger.info("API initialized successfully")
    
    return app