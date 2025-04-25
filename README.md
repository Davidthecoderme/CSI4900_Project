# SkinScan AI Health Assistant

## Project Overview

SkinScan AI Health Assistant is a comprehensive solution for early skin lesion assessment and skin health education. The system leverages deep learning models to analyze dermoscopic images of skin lesions, providing preliminary risk assessments and educational guidance to users.

This project addresses the challenge of limited access to dermatological care by creating an accessible screening tool that can help users determine when professional medical evaluation is warranted. Early detection of concerning skin conditions can significantly improve treatment outcomes, particularly for serious conditions like melanoma.

## Repository Structure

```
SkinScan-AI/
├── api-server/        # Backend server with AI models and API endpoints
├── mobile-app/        # React Native mobile application 
├── tool/              # CLI tool for testing the model locally
├── .gitattributes     # Git configuration file
├── CSI4900_EfficientNetV2_Large.ipynb  # Model training notebook
└── README.md          # This file
```

Each component contains its own detailed README with specific setup instructions and technical documentation.

## Components

### API Server

The backend server implements a multi-layered architecture that processes images through a classification pipeline:

1. **Skin Detection**: Validates that the uploaded image contains skin tissue
2. **Lesion Segmentation**: Identifies and isolates the skin lesion region
3. **Lesion Classification**: Categorizes the lesion into one of seven diagnostic classes

The server exposes RESTful API endpoints for image analysis and chatbot functionality, built with FastAPI for high performance and automatic documentation generation.

### Mobile Application

The cross-platform mobile client provides an intuitive interface for users to:

- Capture high-quality dermoscopic images with guided assistance
- View analysis results with appropriate risk indicators
- Access educational content about skin health
- Interact with an AI-powered chatbot for skin health questions
- Track lesion history over time

Built with React Native, Expo, and TypeScript, the application delivers a consistent experience on both iOS and Android devices.

### CLI Tool

A command-line tool for quick testing of the skin lesion classification model. This tool enables developers and researchers to:

- Perform rapid assessment of skin lesion images using the same model deployed in the server
- View classification results with confidence scores
- Optionally visualize results with prediction overlays

## Model Information

SkinScan AI uses the EfficientNetV2-Large architecture trained on the HAM10000 dataset to classify skin lesions into seven categories:

- Melanocytic nevi (nv)
- Melanoma (mel)
- Benign keratosis-like lesions (bkl)
- Basal cell carcinoma (bcc)
- Actinic keratoses (akiec)
- Vascular lesions (vasc)
- Dermatofibroma (df)

The model achieves 92.93% overall accuracy on test data, with performance variations across different diagnostic categories.

## Getting Started

### Prerequisites

- Node.js (v16+) and npm/yarn for the mobile application
- Python 3.8+ for the server and CLI tool
- Git

### Basic Setup

1. Clone the repository:
   ```
   git clone https://github.com/Davidthecoderme/CSI4900_Project.git
   cd CSI4900_Project
   ```

2. For API server setup, refer to the README in the `api-server` directory.

3. For mobile application setup, refer to the README in the `mobile-app` directory.

4. For tool setup, refer to the README in the `tool` directory.

## Development Workflow

For optimal development:

1. Set up and start the API server first
2. Configure the mobile app to connect to your local server instance
3. Use the CLI tool for quick model testing without needing the complete application stack

## Medical Disclaimer

SkinScan AI Health Assistant is intended for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. The system provides preliminary assessments that should always be confirmed by qualified healthcare providers.

## Acknowledgments

- The HAM10000 dataset for providing dermatoscopic images
- The COCO2017 dataset for non-skin image training data
- Dr. Abdulmotaleb El Saddik and the University of Ottawa's School of Electrical Engineering and Computer Science