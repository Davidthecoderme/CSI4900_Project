from pydantic import BaseModel
from typing import Optional, List, Dict

# Chat API schemas
class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    """
    message: str

class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.
    """
    response: str

# Image detection API schemas
class PredictionResult(BaseModel):
    """
    Single prediction result with label, name and probability.
    """
    label: str
    name: str
    probability: str

class ClassificationResult(BaseModel):
    """
    Complete classification result with main prediction and top alternatives.
    """
    prediction: PredictionResult
    top3: List[PredictionResult]

class ImageDetectionResponse(BaseModel):
    """
    Response model for image detection endpoint.
    """
    status: str
    message: Optional[str] = None
    processedImage: Optional[str] = None  # Base64 encoded segmentation mask
    result: Optional[ClassificationResult] = None