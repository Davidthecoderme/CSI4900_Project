 
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import logging
import time
from ..infrastructure.config_manager import get_settings

logger = logging.getLogger(__name__)

def setup_middlewares(app: FastAPI) -> None:
    """
    Configure middlewares for the FastAPI application.
    """
    # Get application settings
    settings = get_settings()
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        # Log request details
        process_time = time.time() - start_time
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"Status: {response.status_code} "
            f"Duration: {process_time:.3f}s"
        )
        
        return response
    
    # Add error handling middleware if needed
    @app.middleware("http")
    async def errors_handling(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            return Response(
                content={"detail": "Internal server error"},
                status_code=500,
                media_type="application/json"
            )