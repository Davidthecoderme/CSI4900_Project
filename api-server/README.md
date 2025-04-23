# Skin Lesion Detection api sever

A comprehensive system for detecting and classifying skin lesions from images, with an integrated health assistant chatbot. This application uses deep learning models to perform skin validation, lesion segmentation, and classification of skin conditions.

## Features

- **Skin Validation**: Determines if an uploaded image contains skin
- **Lesion Segmentation**: Creates a mask highlighting the lesion area
- **Lesion Classification**: Identifies 7 different types of skin lesions
- **Health Assistant**: AI-powered chat interface for health-related questions
- **RESTful API**: Clean API endpoints for integration with web and mobile applications

## Architecture

The system follows a clean, layered architecture:

1. **API Layer**: Handles HTTP requests, validation, and routing
2. **Service Layer**: Orchestrates business logic and workflows
3. **Domain Layer**: Contains core business logic and algorithms
4. **Infrastructure Layer**: Provides technical capabilities (model management, file operations, configuration)

This design ensures separation of concerns, maintainability, and testability.

## Installation

### Prerequisites

- Python 3.8 or higher
- Pip package manager
- [Optional] CUDA-compatible GPU for faster processing

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skin-lesion-detection.git
   cd skin-lesion-detection
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download models:
   The application requires three model files placed in the `models` directory:
   - `skin_vs_non_skin.h5`: Skin validation model
   - `unet_segmentation.h5`: Lesion segmentation model
   - `complete_model.pth`: Lesion classification model

5. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to set your Gemini API key and other configuration options.

## Usage

### Starting the Server

Run the application:
```bash
python main.py
```

The API will be available at `http://localhost:8000`.

### API Endpoints

1. **Health Assistant Chat**
   - **URL**: `/api/chat`
   - **Method**: POST
   - **Body**: `{"message": "Is melanoma dangerous?"}`
   - **Response**: AI-generated health information

2. **Skin Lesion Detection**
   - **URL**: `/api/detect`
   - **Method**: POST
   - **Body**: Form data with image file
   - **Response**: Segmentation mask and classification results

3. **Test Verification Endpoint**
   - **URL**: `/api/test-detect`
   - **Method**: GET
   - **Response**: Sample skin lesion detection response with predefined data
   - **Purpose**: Verifies API response format and structure without requiring image upload

### Verification and Testing

The test endpoint (`/api/test-detect`) provides a convenient way to verify that the system is properly formatting responses according to the expected schema. This is particularly useful for:

- Confirming API integration before implementing client-side image handling
- Validating response parsers in client applications
- Troubleshooting response format issues

The test endpoint returns a sample response with the exact structure that real classification requests will produce, including base64-encoded image data and multi-level classification results.

### Example Client Usage

```python
import requests

# Chat with health assistant
response = requests.post(
    "http://localhost:8000/api/chat",
    json={"message": "What are the symptoms of melanoma?"}
)
print(response.json()["response"])

# Detect skin lesion
with open("sample_image.jpg", "rb") as f:
    files = {"file": ("sample_image.jpg", f, "image/jpeg")}
    response = requests.post("http://localhost:8000/api/detect", files=files)
print(response.json())

# Test API response format
response = requests.get("http://localhost:8000/api/test-detect")
print(response.json())
```

## Configuration

The application can be configured through environment variables in the `.env` file:

- `GEMINI_API_KEY`: API key for Google's Gemini AI
- `GEMINI_MODEL_NAME`: Model name for Gemini AI (default: "gemini-1.5-pro")
- `UPLOAD_DIR`: Directory for temporary file storage
- `MODELS_DIR`: Directory containing ML models
- `LOG_LEVEL`: Logging verbosity (INFO, DEBUG, etc.)
- `APP_ENV`: Application environment (development, testing, production)

## Project Structure

```
skin_lesion_system/
├── app/
│   ├── api/               # API layer components
│   ├── services/          # Service layer components
│   ├── domain/            # Domain layer components
│   ├── infrastructure/    # Infrastructure layer components
│   ├── exceptions/        # Custom exception classes
├── models/                # ML model files
├── config/                # Configuration management
├── main.py                # Application entry point
├── requirements.txt       # Dependencies
└── .env                   # Environment variables
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The HAM10000 dataset for providing training data for skin lesion classification
- Google's Gemini AI for powering the health assistant