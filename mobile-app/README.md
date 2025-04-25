# SkinScan AI Mobile Application

## Overview

The SkinScan AI mobile application provides an intuitive interface for skin lesion assessment and skin health education. Built with React Native and Expo, this cross-platform application delivers a consistent user experience on both iOS and Android devices.

## Features

- **Guided Image Capture**: Step-by-step assistance for capturing high-quality dermoscopic images
- **AI-Powered Analysis**: Integration with backend services for lesion classification
- **Educational Content**: Access to skin health information through FAQ and blog sections
- **Interactive Chatbot**: AI-driven conversational assistant for skin health questions
- **History Tracking**: Capability to monitor skin lesions over time

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo Go application installed on your physical device:
  - [Download on App Store](https://apps.apple.com/app/apple-store/id982107779) for iOS
  - [Download on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) for Android
- Both your development computer and mobile device must be connected to the same Wi-Fi network

## Setup Instructions

### 1. Install Dependencies

First, install the core dependencies:

```bash
npm install
npm install expo-constants
```

Then, install the required packages:

```bash
# API and image handling
npm install axios expo-image-picker expo-router firebase

# AWS integration
npm install @aws-sdk/client-s3

# Utilities
npm install react-native-get-random-values
expo install expo-linear-gradient
npm install @expo/vector-icons
npm install @react-native-picker/picker
npm install react-native-keyboard-aware-scroll-view
```

### 2. Configure Server Connection

**CRITICAL REQUIREMENT**: The application requires a properly configured IP address in a `.env` file to function. Without this configuration, the application will not be able to connect to the backend server and will not work.

Follow these steps carefully:

1. Find your local IP address:
   - **Windows**: Open Command Prompt and type `ipconfig` (use the IPv4 address)
   - **macOS/Linux**: Open Terminal and type `ifconfig` or `ip addr show`

2. Create or edit the `.env` file in the project root directory:
   ```
   IP_ADDR=192.168.1.2  # Replace with your actual IP address
   ```

3. Save the `.env` file before proceeding. This step must be completed before starting the application.

The application uses this IP address to establish communication with the backend server. Any errors in this configuration will prevent the application from functioning properly.

### 3. Start the Application

Launch the Expo development server:

```bash
npx expo start
```

### 4. Connect with Your Device

After starting the development server, you'll see a QR code in your terminal. This QR code is the connection point between your development server and the Expo Go app.

#### Connection Process:

1. Ensure your mobile device is connected to the same Wi-Fi network as your development computer. This is essential - the connection will not work across different networks.

2. Open the Expo Go app on your device:
   - **iOS**: Use your device's camera to scan the QR code
   - **Android**: Open the Expo Go app and use the "Scan QR Code" option

3. The Expo Go app will download the JavaScript bundle from your development server and render the application.

4. Any changes you make to the code will automatically update on your device when you save the files (hot reloading).

### Alternative Connection Methods

If QR code scanning isn't working:

- Press 'a' in the terminal to open on an Android emulator (must be installed separately)
- Press 'i' in the terminal to open on an iOS simulator (Mac only, requires Xcode)
- Use the "Projects" tab in Expo Go to connect to recently opened projects

## Application Usage Flow

The typical workflow for using the SkinScan AI application is:

1. **Authentication**: Create an account or login to access the application features
2. **Navigation**: Use the tab menu to access different application sections
3. **Scanning**: Select the Scan tab to capture an image of a skin lesion
4. **Analysis**: Review the AI assessment results and recommended actions
5. **Education**: Access the educational content or chat with the AI assistant for additional information
6. **History**: Track lesion changes over time by comparing current and previous scans

## Development Notes

- The application utilizes Expo Router for navigation
- Real-time image analysis requires an active connection to the backend server
- Educational content is cached for offline access
- User history is stored locally with optional cloud synchronization

## Troubleshooting

### Common Issues

1. **Cannot connect to development server**:
   - Confirm both devices are on the same Wi-Fi network
   - Ensure no firewall or network restrictions are blocking the connection
   - Try using a mobile hotspot from your computer if your institutional Wi-Fi has restrictions

2. **QR code scanning not working**:
   - Ensure adequate lighting and camera focus when scanning
   - Try entering the displayed URL manually in the Expo Go app
   - Check if the Expo Go app has camera permissions enabled

3. **Camera or image picker not working**:
   - Ensure necessary permissions are granted in your device settings
   - Try restarting the Expo Go app

4. **Server connection errors**:
   - Verify the server-api is running
   - Double-check the IP address configuration







