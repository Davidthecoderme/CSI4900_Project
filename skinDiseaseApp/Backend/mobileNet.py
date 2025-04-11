from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess

app = FastAPI()

class ImagePath(BaseModel):
    imagePath: str

@app.post('/classify')
async def classify_image(data: ImagePath):
    image_path = data.imagePath

    try:
        result = subprocess.run(
            ['python', 'skin_lesion_classifier.py', '--image', image_path],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr)
        return {'result': result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)

# mobileNet.py