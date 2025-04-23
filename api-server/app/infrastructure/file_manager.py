 
import os
import logging
import uuid
import aiofiles
from fastapi import UploadFile
from ..exceptions.custom_exceptions import FileOperationError

logger = logging.getLogger(__name__)

class FileManager:
    """
    Service for handling file operations.
    """
    
    def __init__(self, upload_dir: str = None):
        """
        Initialize the file manager.
        
        Args:
            upload_dir: Directory for temporary file storage (default from settings)
        """
        from .config_manager import get_settings
        
        self.settings = get_settings()
        self.upload_dir = upload_dir or self.settings.UPLOAD_DIR
        
        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)
        
        logger.info(f"FileManager initialized with upload directory: {self.upload_dir}")
    
    async def save_upload(self, file: UploadFile) -> str:
        """
        Save an uploaded file to a temporary location.
        
        Args:
            file: The uploaded file
            
        Returns:
            str: Path to the saved file
            
        Raises:
            FileOperationError: If file operation fails
        """
        try:
            # Generate a unique filename with original extension
            file_ext = os.path.splitext(file.filename)[1]
            temp_filename = f"{uuid.uuid4()}{file_ext}"
            temp_path = os.path.join(self.upload_dir, temp_filename)
            
            # Save the file
            async with aiofiles.open(temp_path, 'wb') as buffer:
                # Read file in chunks to handle large files
                while content := await file.read(1024 * 1024):  # 1MB chunks
                    await buffer.write(content)
            
            # Verify file was written
            if os.path.getsize(temp_path) == 0:
                raise ValueError("Uploaded file is empty")
            
            logger.info(f"File saved to {temp_path}")
            return temp_path
            
        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            raise FileOperationError("save", file.filename, str(e))
    
    async def remove_file(self, file_path: str) -> bool:
        """
        Remove a file from the filesystem.
        
        Args:
            file_path: Path to the file to remove
            
        Returns:
            bool: True if removal was successful
            
        Raises:
            FileOperationError: If file removal fails
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File removed: {file_path}")
                return True
            else:
                logger.warning(f"File not found for removal: {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error removing file {file_path}: {str(e)}")
            raise FileOperationError("remove", file_path, str(e))