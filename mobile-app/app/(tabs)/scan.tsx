// Scan.tsx
import React, { useState, useEffect } from 'react';

import Constants from 'expo-constants';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { auth, db } from '../../database/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadFileToS3 } from '../../database/s3';

const IP_ADDR = Constants.expoConfig.extra.ipAddr;

const API_URL = `http://${IP_ADDR}:8000/api/detect`;

export default function HomeScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [detectionInProgress, setDetectionInProgress] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [formattedResult, setFormattedResult] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  // Format the detection result for display whenever it changes
  useEffect(() => {
    if (detectionResult) {
      formatDetectionResult();
    }
  }, [detectionResult]);

  // Format detection result as a readable string
  const formatDetectionResult = () => {
    if (!detectionResult) return;
    
    try {
      let resultText = '';
      
      // Format the main prediction
      if (detectionResult.prediction) {
        const pred = detectionResult.prediction;
        resultText += `Prediction: ${pred.name} (${pred.probability})\n\n`;
      }
      
      // Format top 3 predictions if available
      if (detectionResult.top3 && detectionResult.top3.length > 0) {
        resultText += 'Top 3 predictions:\n';
        detectionResult.top3.forEach((item, index) => {
          resultText += `${index + 1}. ${item.name}: ${item.probability}\n`;
        });
      }
      
      setFormattedResult(resultText);
    } catch (error) {
      console.error('Error formatting result:', error);
      setFormattedResult('Error displaying result');
    }
  };

  // Request permissions for media library and camera
  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert('Media library and camera permissions are required!');
    }
  };

  // Pick images from the media library
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  // Take a photo using the camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera permission is required to take photos!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Call the detection API after uploading image to S3 and recording it in Firestore.
  const handleStartDetecting = async () => {
    if (images.length === 0) {
      Alert.alert('No images selected for detection');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }
    setDetectionInProgress(true);
    setDetectionResult(null);
    setFormattedResult(null);
    try {
      const fileUri = images[0];
      let filename = fileUri.split('/').pop();
      if (!filename) filename = 'image.jpg';

      // Upload image to S3 and record it in Firestore
      const fileUrl = await uploadFileToS3(fileUri, user.uid);
      if (fileUrl) {
        await addDoc(collection(db, 'images'), {
          downloadURL: fileUrl,
          userId: user.uid,
          timestamp: new Date().toISOString(),
        });
      }

      // Prepare the form data for detection API
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'not_skin') {
        Alert.alert('The image is not skin-related');
      }

      if (response.data.processedImage) {
        const cleanBase64 = response.data.processedImage
          .split('\n')
          .find((line: string) => line.startsWith('data:image/'));
        if (cleanBase64) {
          setImages(prev => [...prev, cleanBase64]);
        }
      }

      if (response.data.result) {
        setDetectionResult(response.data.result);
      }
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Detection failed');
    } finally {
      setDetectionInProgress(false);
    }
  };

  // Remove an image from the list by index
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Improved function to extract just the top disease from detection result
  const getTopDisease = (): string => {
    try {
      if (detectionResult && detectionResult.prediction) {
        return detectionResult.prediction.name;
      }
      return "Unknown condition";
    } catch (e) {
      console.error('Error extracting top disease:', e);
      return "Unknown condition";
    }
  };

  // Improved navigation function to pass only the disease name to chatbot
  const navigateToChatbot = () => {
    if (detectionResult) {
      const topDisease = getTopDisease();
      console.log("Sending to chatbot:", topDisease);
      
      // Create a better query for the AIBot
      const query = `I was diagnosed with ${topDisease}. What should I know about this condition?`;
      
      router.push({ 
        pathname: '../chatBot', 
        params: { treatmentQuery: query } 
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detection Feature</Text>

      {images.length > 0 ? (
        <FlatList
          horizontal
          data={images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item }} style={styles.image} />
              <TouchableOpacity style={styles.closeButton} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          style={{ marginVertical: 10 }}
        />
      ) : (
        <Text style={styles.infoText}>No images selected</Text>
      )}

      <TouchableOpacity
        style={[styles.button, uploading && styles.disabledButton]}
        onPress={pickImages}
        disabled={uploading}
      >
        <Ionicons name="images-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Select Photos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, uploading && styles.disabledButton]}
        onPress={takePhoto}
        disabled={uploading}
      >
        <Ionicons name="camera-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.detectButton, detectionInProgress && styles.disabledButton]}
        onPress={handleStartDetecting}
        disabled={detectionInProgress}
      >
        {detectionInProgress ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="search" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Start Detecting</Text>
          </>
        )}
      </TouchableOpacity>

      {formattedResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{formattedResult}</Text>
        </View>
      )}

      {detectionResult && (
        <TouchableOpacity style={styles.chatbotHint} onPress={navigateToChatbot}>
          <Text style={styles.chatbotHintText}>Chat with our AIBot</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  infoText: {
    marginVertical: 10,
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'purple',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#e6f7ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    maxWidth: '90%',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  chatbotHint: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
  },
  chatbotHintText: {
    fontSize: 16,
    color: '#333',
  },
});