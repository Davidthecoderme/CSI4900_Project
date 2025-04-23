import logging
from app.api import init_api
from app.infrastructure.config_manager import configure_logging

# Configure logging first
configure_logging()
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = init_api()

@app.on_event("startup")
async def startup_event():
    """
    Perform any necessary startup tasks.
    """
    logger.info("Application starting up")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Perform any necessary cleanup on shutdown.
    """
    logger.info("Application shutting down")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting application server")
    uvicorn.run(app, host="0.0.0.0", port=8000)