import logging
from fastapi import FastAPI, HTTPException,UploadFile, File
from pydantic import BaseModel
import google.generativeai as genai
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import subprocess
import traceback
import uuid
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Please set the GEMINI_API_KEY environment variable.")

genai.configure(api_key=GEMINI_API_KEY)


MODEL_NAME = "gemini-1.5-pro"  


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class ImagePath(BaseModel):
    imagePath: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_message = request.message
    logger.info(f"Received message: {user_message}")

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"You are a health assistant. Provide accurate and helpful information about diseases or health-related questions. User: {user_message}"
        logger.info(f"Sending prompt to Gemini: {prompt}")
        
        response = model.generate_content(prompt)
        logger.info(f"Received response from Gemini: {response.text}")
        
        return ChatResponse(response=response.text)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/detect')
async def classify_imagess(file: UploadFile = File(...)):
    os.makedirs('temp_uploads', exist_ok=True)
    # print(f"Received file: {file.read()},")
    
    try:

        file_ext = os.path.splitext(file.filename)[1]
        temp_path = f"temp_uploads/{uuid.uuid4()}.jpg"
        
        print(f"Received file: {temp_path},")
        # read file
        with open(temp_path, 'wb') as buffer:
            while content := await file.read(1024 * 1024):
                buffer.write(content)

        file_size = os.path.getsize(temp_path)
        print(f"Saved file size: {file_size} bytes")
        
        # Verify file was written
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        logger.info(f"Processing image: {temp_path}")
        
        # Run
        result = subprocess.run(
            ['python', 'skin_lesion_classifier.py', '--image', temp_path],
            capture_output=True,
            text=True,
            timeout=30  # Add timeout to prevent hanging
        )
        logger.info(f"Successfully processed image. Result: {result.stdout}")
        
        # Clean up temp file
        try:
            os.remove(temp_path)
        except OSError as e:
            logger.warning(f"Could not remove temp file: {e}")
        
        # Handle subprocess results
        if result.returncode != 0:
            logger.error(f"Classification failed: {result.stderr}")
            raise HTTPException(
                status_code=400,
                detail=f"Classification error: {result.stderr[:200]}" 
            )
            
        logger.info(f"Successfully processed image. Result: {result.stdout}")
        return {'result': result.stdout.strip()}
        
    except subprocess.TimeoutExpired:
        logger.error("Classification timed out")
        raise HTTPException(status_code=504, detail="Classification timed out")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing error")




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)