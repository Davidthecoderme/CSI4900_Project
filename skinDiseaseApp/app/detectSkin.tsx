// app/DetectScreen.tsx
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
import { useRouter } from 'expo-router';
import { auth , db} from '../database/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadFileToS3 } from '../database/s3';
import axios from "axios";

const API_URL = "http://192.168.2.25:8000/detect";

export default function DetectSkin() {
  const router = useRouter();
  const user = auth.currentUser;

  const [images, setImages] = useState<string[]>([]);
  const [maskImage, setMaskImage] = useState();
  const [uploading, setUploading] = useState(false);
  const [detectionInProgress, setDetectionInProgress] = useState(false);
  const [detectionResult, setDetectionResult] = useState<string | null>(null);


  useEffect(() => {
    if (!user) {
      Alert.alert('Please login first');
      router.replace('./login');
    }
  }, [user]);


  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert('Need media library and camera permissions to use all features!');
    }
  };
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, 
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        setImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      console.error('pickImages error:', error);
    }
  };
    
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Need camera permission to take photos!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        setImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      console.error('takePhoto error:', error);
    }
  };

  // s3 testing 
  const handleUpload = async () => {
    if (!user) {
      Alert.alert('Please login first');
      return;
    }
    if (images.length === 0) {
      Alert.alert('No images selected');
      return;
    }
    setUploading(true);
    try {
      for (const imageUrl of images) {
        const fileUrl = await uploadFileToS3(imageUrl, user.uid);
        if (fileUrl) {
          await addDoc(collection(db, 'images'), {
            downloadURL: fileUrl,
            userId: user.uid,
            timestamp: new Date().toISOString(),
          });
        }
      }
      Alert.alert('Upload successful!');
      // Clear images after successful upload
      setImages([]);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload failed, please try again');
    } finally {
      setUploading(false);
    }
  };

  // make a dummy detection, will add ai model later


  const handleStartDetecting = async () => {
    if (images.length === 0) {
      Alert.alert('No images selected for detection');
      return;
    }
    console.log(images[0]);
    setDetectionInProgress(true);
    setDetectionResult(null);
    try {
    const formData = new FormData();
    const fileUri = images[0];
    console.log(fileUri);

    // Extract filename (Android/iOS compatible)
    let filename = fileUri.split('/').pop();
    if (!filename) filename = 'image.jpg'; // fallback
    console.log(filename);

    formData.append('file', {
      uri: fileUri,
      name: filename,
      
    } as any); // `as any` to bypass TypeScript errors

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
<<<<<<< Updated upstream

      setDetectionResult(response.data.result);
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
=======

    // Handle different response types
    if (typeof response.data === 'number') {
      if (response.data === 0) {
        Alert.alert('Image not skin-related');
      }
      return;
    }

      // setImages(response.data.maskImage);
      // setMaskImage(response.data.maskImage);
      // console.log('hello'+response.data.processedImage)

      if (response.data.processedImage) {
        const cleanBase64 = response.data.processedImage
        .split('\n')
        .find((line: string) => line.startsWith('data:image/'));
        console.log('New image:', cleanBase64); 


        setImages(prev => [...prev, cleanBase64]);

        const newMaskImage = response.data.processedImage;

      }
  
      if (response.data.result) {
        setDetectionResult(response.data.result);
      }

>>>>>>> Stashed changes
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Detection failed');
    } finally {
      setDetectionInProgress(false);
    }
  };




  
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detect Screen</Text>

      {images.length > 0 ? (
        <FlatList
          horizontal
          data={images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item }} style={styles.image} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          style={{ marginVertical: 10 }}
        />
      ) : (
        <Text style={styles.infoText}>No images selected</Text>
      )}

      {/* {maskImage && (
          <View style={styles.imageContainer}>
            <Text>Segmentation Mask</Text>
            <Image source={{ uri: maskImage }} style={styles.image} />
          </View>
        )} */}

      

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
        style={[styles.button, uploading && styles.disabledButton]}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Upload to S3 (Test)</Text>
          </>
        )}
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
      {/* {maskImage && (
          <View style={styles.imageContainer}>
            <Text>Segmentation Mask</Text>
            <Image source={{ uri: maskImage }} style={styles.image} />
          </View>
        )} */}

      {detectionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{detectionResult}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 20,
  },
});
