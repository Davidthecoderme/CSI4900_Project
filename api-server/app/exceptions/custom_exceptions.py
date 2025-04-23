 
class BaseApplicationError(Exception):
    """Base exception class for application-specific errors."""
    def __init__(self, message: str = "An application error occurred"):
        self.message = message
        super().__init__(self.message)


class NotSkinImageError(BaseApplicationError):
    """Exception raised when an uploaded image is not skin-related."""
    def __init__(self, message: str = "Image does not contain skin"):
        self.message = message
        super().__init__(self.message)


class SegmentationError(BaseApplicationError):
    """Exception raised when the segmentation model fails to process an image."""
    def __init__(self, message: str = "Failed to segment the skin lesion"):
        self.message = message
        super().__init__(self.message)


class ClassificationError(BaseApplicationError):
    """Exception raised when the classification model fails to process an image."""
    def __init__(self, message: str = "Failed to classify the skin lesion"):
        self.message = message
        super().__init__(self.message)


class ModelLoadingError(BaseApplicationError):
    """Exception raised when an AI model fails to load."""
    def __init__(self, model_name: str, details: str = ""):
        self.message = f"Failed to load model: {model_name}"
        if details:
            self.message += f" - {details}"
        super().__init__(self.message)


class FileOperationError(BaseApplicationError):
    """Exception raised when file operations (read/write/delete) fail."""
    def __init__(self, operation: str, path: str, details: str = ""):
        self.message = f"File operation {operation} failed on {path}"
        if details:
            self.message += f" - {details}"
        super().__init__(self.message)


class AIServiceError(BaseApplicationError):
    """Exception raised when external AI service (like Gemini) fails."""
    def __init__(self, service: str, details: str = ""):
        self.message = f"External AI service error: {service}"
        if details:
            self.message += f" - {details}"
        super().__init__(self.message)