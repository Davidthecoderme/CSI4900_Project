from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from .dependencies import get_chat_service, get_image_service
from ..services.chat_service import ChatService
from ..services.image_processing_service import ImageProcessingService
from .schemas import ChatRequest, ChatResponse, ImageDetectionResponse
from ..exceptions.custom_exceptions import NotSkinImageError, SegmentationError, ClassificationError
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api")

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    chat_service: ChatService = Depends(get_chat_service)
):
    try:
        logger.info(f"Received chat request")
        response = await chat_service.process_message(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect", response_model=ImageDetectionResponse)
async def detect_skin_lesion(
    file: UploadFile = File(...), 
    image_service: ImageProcessingService = Depends(get_image_service)
):
    try:
        logger.info(f"Received image for skin lesion detection")
        result = await image_service.process_image(file)
        return result
    except NotSkinImageError as e:
        logger.info(f"Image not related to skin: {str(e)}")
        return ImageDetectionResponse(
            status="not_skin", 
            message="Image is not skin-related",
            processedImage=None,
            result=None
        )
    except SegmentationError as e:
        logger.error(f"Segmentation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Segmentation error: {str(e)}")
    except ClassificationError as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Classification error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in detect endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing error")

@router.get("/api/test-detect", response_model=ImageDetectionResponse)
async def test_detect_endpoint():
    """
    Test endpoint that returns a sample skin lesion detection response.
    """
    return {
        "status": "success",
        "processedImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAADg...[truncated]",
        "result": {
            "prediction": {
                "label": "nv",
                "name": "Melanocytic nevi",
                "probability": "99.73%"
            },
            "top3": [
                {
                    "label": "nv",
                    "name": "Melanocytic nevi",
                    "probability": "99.73%"
                },
                {
                    "label": "vasc",
                    "name": "Vascular lesions",
                    "probability": "0.14%"
                },
                {
                    "label": "bkl",
                    "name": "Benign keratosis-like lesions",
                    "probability": "0.12%"
                }
            ]
        }
    }