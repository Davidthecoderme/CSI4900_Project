 
import logging
from ..infrastructure.config_manager import get_settings
from ..exceptions.custom_exceptions import AIServiceError
import google.generativeai as genai
from typing import Optional

logger = logging.getLogger(__name__)

class ChatService:
    """
    Service for handling chat interactions using Google's Gemini AI.
    """
    
    def __init__(self):
        """
        Initialize the ChatService by setting up the Gemini AI client.
        """
        self.settings = get_settings()
        self._setup_gemini()
        
    def _setup_gemini(self):
        """
        Configure the Gemini AI client with API key from settings.
        """
        try:
            genai.configure(api_key=self.settings.GEMINI_API_KEY)
            self.model_name = self.settings.GEMINI_MODEL_NAME
            logger.info(f"Gemini AI configured with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to configure Gemini AI: {str(e)}")
            raise AIServiceError("Gemini", str(e))
    
    async def process_message(self, message: str) -> str:
        """
        Process a user message through the Gemini health assistant.
        
        Args:
            message: User's health-related question or statement
            
        Returns:
            str: Generated response from the health assistant
        """
        try:
            # Create model instance
            model = genai.GenerativeModel(self.model_name)
            
            # Format prompt with health assistant context
            prompt = (
                f"You are a health assistant. Provide accurate and helpful "
                f"information about diseases or health-related questions. "
                f"User: {message}"
            )
            
            logger.info("Sending message to Gemini AI")
            response = model.generate_content(prompt)
            logger.info("Received response from Gemini AI")
            
            if not hasattr(response, 'text'):
                raise AIServiceError("Gemini", "No response text returned")
                
            return response.text
            
        except Exception as e:
            logger.error(f"Error processing message with Gemini AI: {str(e)}")
            raise AIServiceError("Gemini", str(e))