// app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
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

const API_URL = "http://192.168.2.17:8000/detect";

export default function HomeScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [detectionInProgress, setDetectionInProgress] = useState(false);
  const [detectionResult, setDetectionResult] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

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
  const getTopDisease = (result: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      let topDisease = '';
      let maxProb = -Infinity;
      
      // Handle object format {disease: probability}
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [disease, prob] of Object.entries(parsed)) {
          if (typeof prob === 'number' && prob > maxProb) {
            maxProb = prob;
            topDisease = disease;
          }
        }
        if (topDisease) return topDisease;
      }
      
      return result.split("\n")[0]; // Return first line if parsing fails
    } catch (e) {
      // If JSON parsing fails, try specific format detection
      try {
        // Try to find the line with "Prediction:" in it
        const lines = result.split("\n");
        for (const line of lines) {
          if (line.includes("Prediction:")) {
            return line.split("Prediction:")[1].trim();
          }
        }
        
        // Try to extract from "Top 3 predictions:" format
        const topMatch = result.match(/\d+\.\s+(.*?):\s+\d+\.\d+%/);
        if (topMatch && topMatch[1]) {
          return topMatch[1].trim();
        }
        
        // Try to parse from comma-separated format
        const items = result.split(',');
        let topDisease = '';
        let maxPercent = -1;
        
        for (let item of items) {
          const parts = item.split(':');
          if (parts.length >= 2) {
            const disease = parts[0].trim();
            const percentStr = parts[1].trim().replace('%', '');
            const percent = parseFloat(percentStr);
            
            if (!isNaN(percent) && percent > maxPercent) {
              maxPercent = percent;
              topDisease = disease;
            }
          }
        }
        
        if (topDisease) return topDisease;
      } catch (innerError) {
        console.error('Error parsing detection result:', innerError);
      }
      
      // If all parsing attempts fail, return first 30 chars
      return result.substring(0, 30).split("\n")[0];
    }
  };

  // Improved navigation function to pass only the disease name to chatbot
  const navigateToChatbot = () => {
    if (detectionResult) {
      const topDisease = getTopDisease(detectionResult);
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

      {detectionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{detectionResult}</Text>
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