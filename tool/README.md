# Skin Lesion Classification CLI Tool

A Python-based CLI tool for classifying skin lesion images using a deep learning model trained on the HAM10000 dataset. This tool allows for quick and easy classification of dermoscopic images into 7 different skin conditions.

## Overview

This tool uses a pre-trained MobileNetV2 CNN model to analyze dermoscopic images of skin lesions and classify them into one of the following categories:

- Melanocytic nevi (nv)
- Melanoma (mel)
- Benign keratosis-like lesions (bkl)
- Basal cell carcinoma (bcc)
- Actinic keratoses (akiec)
- Vascular lesions (vasc)
- Dermatofibroma (df)

The model provides both the predicted class and confidence scores for the top 3 most likely conditions.

## Background

The HAM10000 dataset ("Human Against Machine with 10000 training images") is a large collection of multi-source dermatoscopic images of common pigmented skin lesions. The model used in this tool was trained on this dataset to identify and classify various skin conditions, including potentially dangerous ones like melanoma.

**Note:** This tool is for educational and research purposes only. It should not replace professional medical advice or diagnosis.

## Installation

### Prerequisites

- Python 3.6 or higher
- PyTorch 2.0 or higher

### Steps

1. Clone this repository:
   ```
   git clone https://github.com/Davidthecoderme/CSI4900_Project.git
   cd CSI4900_Project/tool
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

The basic usage of the tool is:

```
python skin_lesion_classifier.py --image path/to/your/image.jpg
```

### Options

- `--image`: Path to the skin lesion image to classify (required)
- `--visualize`: Display the image with prediction overlay (optional)

### Example

```
python skin_lesion_classifier.py --image examples/ISIC_0029313.jpg --visualize
```

## Output

The tool provides the following information:

1. The primary prediction (skin condition class and name)
2. Confidence score for the primary prediction
3. Top 3 most likely conditions with their confidence scores
4. Visual representation of results (when using the `--visualize` flag)

Example output:
```
Using model: complete_model.pth
Using device: cpu

Prediction: Melanocytic nevi (nv)
Confidence: 98.72%

Top 3 predictions:
1. Melanocytic nevi (nv): 98.72%
2. Melanoma (mel): 0.89%
3. Benign keratosis-like lesions (bkl): 0.31%
```

## Model Architecture

This tool uses a MobileNetV2 convolutional neural network architecture, which provides a good balance between accuracy and computational efficiency. The model was fine-tuned on the HAM10000 dataset, which contains over 10,000 dermatoscopic images of pigmented skin lesions.

Key features of the model:
- Pretrained on ImageNet and fine-tuned on skin lesion images
- Input image size: 224x224 pixels
- 7-class classification output
- Optimized for both speed and accuracy

## Troubleshooting

### Common Issues

1. **Model Loading Error**:
   - If you encounter an error related to model loading, ensure you're using a compatible PyTorch version
   - For PyTorch 2.6+, the script uses `weights_only=False` to handle the new security features

2. **Image Processing Error**:
   - Ensure your images are in a standard format (JPEG, PNG)
   - Very large images might cause memory issues; consider resizing them before using the tool

3. **CUDA/GPU Issues**:
   - If you have compatibility issues with your GPU, try forcing CPU mode by editing the script

## Requirements

The tool depends on the following Python packages (specified in `requirements.txt`):
- torch>=2.0.0,<2.7.0
- torchvision>=0.15.0,<2.7.0
- pillow>=8.4.0
- matplotlib>=3.5.0
- numpy>=1.21.0
- timm==0.9.5  # For model loading and transformations

## Disclaimer

This tool is intended for research and educational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding medical conditions.

## References

- HAM10000 Dataset: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T
- MobileNetV2 Architecture: Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L. C. (2018). MobileNetV2: Inverted Residuals and Linear Bottlenecks. In Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 4510-4520).
