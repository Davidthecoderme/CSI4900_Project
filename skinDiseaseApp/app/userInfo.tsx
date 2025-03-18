// app/userInfo.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserInfoScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [smokingHistory, setSmokingHistory] = useState(false);
  const [smokingYears, setSmokingYears] = useState('');
  const [drinkingHistory, setDrinkingHistory] = useState(false);
  const [drinkingYears, setDrinkingYears] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert('Please login first');
      router.replace('./login');
    } else {
      fetchUserData(user.uid);
    }
  }, [user]);

  // Fetch user info from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setAge(data.age ? data.age.toString() : '');
        setSmokingHistory(data.smokingHistory || false);
        setSmokingYears(data.smokingYears ? data.smokingYears.toString() : '');
        setDrinkingHistory(data.drinkingHistory || false);
        setDrinkingYears(data.drinkingYears ? data.drinkingYears.toString() : '');
      } else {
        console.log('User document not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      setLoading(false);
      return;
    }

    // password
    if (newPassword.trim().length > 0 || confirmNewPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        Alert.alert('Error', 'New password and confirmation do not match');
        setLoading(false);
        return;
      }
    }

    // Validate smoking/drinking years
    if (smokingHistory) {
      const sYears = parseInt(smokingYears);
      if (isNaN(sYears) || sYears < 1 || sYears > 70) {
        Alert.alert('Error', 'Please enter valid smoking years');
        setLoading(false);
        return;
      }
    }
    if (drinkingHistory) {
      const dYears = parseInt(drinkingYears);
      if (isNaN(dYears) || dYears < 1 || dYears > 70) {
        Alert.alert('Error', 'Please enter valid drinking years');
        setLoading(false);
        return;
      }
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parsedAge,
        smokingHistory,
        smokingYears: smokingHistory ? parseInt(smokingYears) : 0,
        drinkingHistory,
        drinkingYears: drinkingHistory ? parseInt(drinkingYears) : 0,
      });

      if (newPassword.trim().length > 0) {
        await updatePassword(user, newPassword);
      }

      Alert.alert('Success', 'Your profile has been updated');
      router.back();
    } catch (error: any) {
      console.error('Update failed:', error);
      Alert.alert('Error', error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Update User Info</Text>

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />

            {/* Smoking History Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Smoking History?</Text>
              <Switch
                value={smokingHistory}
                onValueChange={setSmokingHistory}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={smokingHistory ? '#4361ee' : '#f4f3f4'}
              />
            </View>
            {smokingHistory && (
              <View>
                <Text style={styles.label}>Smoking Years</Text>
                <TextInput
                  style={styles.input}
                  value={smokingYears}
                  onChangeText={setSmokingYears}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="e.g. 5"
                />
              </View>
            )}

            {/* Drinking History Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Drinking History?</Text>
              <Switch
                value={drinkingHistory}
                onValueChange={setDrinkingHistory}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={drinkingHistory ? '#4361ee' : '#f4f3f4'}
              />
            </View>
            {drinkingHistory && (
              <View>
                <Text style={styles.label}>Drinking Years</Text>
                <TextInput
                  style={styles.input}
                  value={drinkingYears}
                  onChangeText={setDrinkingYears}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="e.g. 3"
                />
              </View>
            )}

            <Text style={styles.label}>New Password (optional)</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Leave blank to keep current password"
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              placeholder="Re-enter new password"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Updating...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  label: {
    color: '#fff',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
