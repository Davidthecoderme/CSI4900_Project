// app/homePage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { auth } from '../database/firebase';
import { db } from '../database/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function HomePage() {
  const router = useRouter();
  const user = auth.currentUser;
  
  // Local state for Firestore user data
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      Alert.alert('Please login first');
      router.replace('./login');
    } else {
      // Real-time subscription to user document changes
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        }
      }, (error) => {
        console.error('Error subscribing to user data:', error);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Sign out logic
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('./login');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>
          Welcome, {userData?.firstName ? userData.firstName : 'User'}!
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('./detectSkin')}
        >
          <Ionicons name="search" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Start Detecting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('./history/HistoryPage')}
        >
          <Ionicons name="time-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('./chatBot')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Chat with Bot</Text>
        </TouchableOpacity>

        {/* User Info button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('./userInfo')}
        >
          <Ionicons name="person-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>User Information</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
