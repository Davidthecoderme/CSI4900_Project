from fastapi import Depends
from ..services.chat_service import ChatService
from ..services.image_processing_service import ImageProcessingService
from ..infrastructure.file_manager import FileManager
from ..infrastructure.model_manager import ModelManager
from ..domain.skin_validator import SkinValidator
from ..domain.lesion_segmenter import LesionSegmenter
from ..domain.lesion_classifier import LesionClassifier

# Infrastructure dependencies
def get_file_manager():
    return FileManager()

def get_model_manager():
    return ModelManager()

# Domain dependencies
def get_skin_validator(model_manager: ModelManager = Depends(get_model_manager)):
    return SkinValidator(model_manager)

def get_lesion_segmenter(model_manager: ModelManager = Depends(get_model_manager)):
    return LesionSegmenter(model_manager)

def get_lesion_classifier(model_manager: ModelManager = Depends(get_model_manager)):
    return LesionClassifier(model_manager)

# Service dependencies
def get_chat_service():
    return ChatService()

def get_image_service(
    file_manager: FileManager = Depends(get_file_manager),
    model_manager: ModelManager = Depends(get_model_manager),
    skin_validator: SkinValidator = Depends(get_skin_validator),
    lesion_segmenter: LesionSegmenter = Depends(get_lesion_segmenter),
    lesion_classifier: LesionClassifier = Depends(get_lesion_classifier)
):
    return ImageProcessingService(
        file_manager=file_manager,
        model_manager=model_manager,
        skin_validator=skin_validator,
        lesion_segmenter=lesion_segmenter,
        lesion_classifier=lesion_classifier
    )