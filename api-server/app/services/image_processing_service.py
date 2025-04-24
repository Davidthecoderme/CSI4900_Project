import logging
import os
from fastapi import UploadFile
from ..domain.skin_validator import SkinValidator
from ..domain.lesion_segmenter import LesionSegmenter
from ..domain.lesion_classifier import LesionClassifier
from ..infrastructure.file_manager import FileManager
from ..infrastructure.model_manager import ModelManager
from ..exceptions.custom_exceptions import NotSkinImageError, SegmentationError, ClassificationError
from ..api.schemas import ImageDetectionResponse

logger = logging.getLogger(__name__)

class ImageProcessingService:
    """
    Service for orchestrating the skin lesion image processing pipeline.
    """

    def __init__(self,
                 file_manager: FileManager = None,
                 model_manager: ModelManager = None,
                 skin_validator: SkinValidator = None,
                 lesion_segmenter: LesionSegmenter = None,
                 lesion_classifier: LesionClassifier = None):
        """
        Initialize the image processing service with its dependencies.

        Args:
            file_manager: Service for handling file operations
            model_manager: Service for managing ML models
            skin_validator: Component for skin validation
            lesion_segmenter: Component for lesion segmentation
            lesion_classifier: Component for lesion classification
        """
        # Initialize dependencies - use dependency injection or create instances
        self.file_manager = file_manager or FileManager()
        self.model_manager = model_manager or ModelManager()
        self.skin_validator = skin_validator or SkinValidator(self.model_manager)
        self.lesion_segmenter = lesion_segmenter or LesionSegmenter(self.model_manager)
        self.lesion_classifier = lesion_classifier or LesionClassifier(self.model_manager)

        logger.info("ImageProcessingService initialized")

    async def process_image(self, file: UploadFile) -> ImageDetectionResponse:
        """
        Process an uploaded image through the skin lesion detection pipeline.

        Args:
            file: The uploaded image file

        Returns:
            ImageDetectionResponse: Result containing segmentation and classification

        Raises:
            NotSkinImageError: If the image does not contain skin
            SegmentationError: If segmentation fails
            ClassificationError: If classification fails
        """
        temp_path = None
        try:
            # Step 1: Save the uploaded file to a temporary location
            temp_path = await self.file_manager.save_upload(file)
            logger.info(f"Image saved temporarily at: {temp_path}")

            # Step 2: Validate if the image contains skin
            is_skin, confidence = await self.skin_validator.validate(temp_path)
            if not is_skin:
                logger.info(f"Image classified as non-skin with confidence: {confidence:.2%}")
                raise NotSkinImageError(f"Image is not skin-related (confidence: {confidence:.2%})")

            logger.info(f"Image validated as skin with confidence: {confidence:.2%}")

            # Step 3: Segment the lesion
            mask_base64 = await self.lesion_segmenter.segment(temp_path)
            if not mask_base64:
                raise SegmentationError("Failed to generate segmentation mask")

            logger.info("Lesion segmentation completed successfully")

            # Step 4: Classify the lesion
            classification_result = await self.lesion_classifier.classify(temp_path)
            if not classification_result:
                raise ClassificationError("Failed to classify the lesion")

            logger.info(f"Lesion classified as: {classification_result}")

            # Step 5: Format the response
            return ImageDetectionResponse(
                status="success",
                processedImage=mask_base64,
                result=classification_result
            )

        except NotSkinImageError as e:
            # This is an expected condition, not an error
            logger.info(str(e))
            raise e

        except (SegmentationError, ClassificationError) as e:
            logger.error(str(e))
            raise e

        except Exception as e:
            logger.error(f"Unexpected error processing image: {str(e)}")
            raise e

        finally:
            # Clean up the temporary file
            if temp_path and os.path.exists(temp_path):
                await self.file_manager.remove_file(temp_path)
                logger.info(f"Temporary file removed: {temp_path}")