// app/(tabs)/more.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../../database/firebase'; 
import { useRouter } from 'expo-router';

export default function MoreScreen() {
  const [user, setUser] = useState<any>(null);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setFirestoreUser(docSnap.data());
        }
      });
      return unsubscribe;
    }
  }, [user]);

 
  const handleUserInfoPress = () => {
    router.push('../userInfo'); 
  };

  
  const handleMenuPress = (title: string) => {
    switch (title) {
      case 'History':
        router.push('../HistoryPage'); 
        break;
      case 'Blog':
        router.push('../blog'); 
        break;
      case 'FAQ':
        router.push('../faq'); 
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('../login'); 
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: { title: string; icon: 'timer-outline' | 'document-text-outline' | 'help-circle-outline' }[] = [
    { title: 'History', icon: 'timer-outline' },
    { title: 'Blog', icon: 'document-text-outline' },
    { title: 'FAQ', icon: 'help-circle-outline' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.menuContainer}>
        <TouchableOpacity style={styles.userInfoCard} onPress={handleUserInfoPress}>
          <View style={styles.profileImageContainer}>
            {user && user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {firestoreUser && firestoreUser.firstName
                    ? firestoreUser.firstName.charAt(0)
                    : 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfoTextContainer}>
            <Text style={styles.userName}>
              {firestoreUser && firestoreUser.firstName && firestoreUser.lastName
                ? `${firestoreUser.firstName} ${firestoreUser.lastName}`
                : user && user.displayName
                ? user.displayName
                : 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user && user.email ? user.email : 'No Email'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.title)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={24} color="#4A90E2" />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))}


        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfoTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF1FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  premiumCard: {
    backgroundColor: '#4AC8EA',
    padding: 20,
    borderRadius: 10,
    marginVertical: 15,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  premiumDescription: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
