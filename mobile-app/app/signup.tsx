import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../database/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [smokingHistory, setSmokingHistory] = useState(false);
  const [smokingYears, setSmokingYears] = useState('');
  const [drinkingHistory, setDrinkingHistory] = useState(false);
  const [drinkingYears, setDrinkingYears] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validation logic
  const validateInputs = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !age) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    if (gender !== 'male' && gender !== 'female') {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    if (smokingHistory) {
      const smokingNum = parseInt(smokingYears);
      if (isNaN(smokingNum) || smokingNum < 0 || smokingNum > 70) {
        Alert.alert('Error', 'Please enter valid smoking years');
        return false;
      }
    }
    if (drinkingHistory) {
      const drinkingNum = parseInt(drinkingYears);
      if (isNaN(drinkingNum) || drinkingNum < 0 || drinkingNum > 70) {
        Alert.alert('Error', 'Please enter valid drinking years');
        return false;
      }
    }
    return true;
  };

  // Signup logic
  const handleSignUp = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        age: parseInt(age),
        gender,
        smokingHistory,
        smokingYears: smokingHistory ? parseInt(smokingYears) : 0,
        drinkingHistory,
        drinkingYears: drinkingHistory ? parseInt(drinkingYears) : 0,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Your account has been created!', [
        { text: 'OK', onPress: () => router.push('./homePage') }
      ]);
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gender radio
  const renderGenderRadio = () => {
    return (
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setGender('male')}
        >
          <View style={[styles.radioCircle, gender === 'male' && styles.radioSelected]} />
          <Text style={styles.radioOptionLabel}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setGender('female')}
        >
          <View style={[styles.radioCircle, gender === 'female' && styles.radioSelected]} />
          <Text style={styles.radioOptionLabel}>Female</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.title}>Create Account</Text>

              <Text style={styles.inputLabel}>
                First Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Last Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Email <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Text style={styles.inputLabel}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                autoComplete="password-new"
              />

              <Text style={styles.inputLabel}>
                Confirm Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password again"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
                autoComplete="off"
              />

              <Text style={styles.inputLabel}>
                Age <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={styles.inputLabel}>
                Gender <Text style={styles.requiredStar}>*</Text>
              </Text>
              {renderGenderRadio()}

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Do you have a smoking history?</Text>
                <Switch
                  value={smokingHistory}
                  onValueChange={setSmokingHistory}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={smokingHistory ? '#4361ee' : '#f4f3f4'}
                />
              </View>
              {smokingHistory && (
                <View>
                  <Text style={styles.inputLabel}>How many years?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    value={smokingYears}
                    onChangeText={setSmokingYears}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              )}

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Do you have a drinking history?</Text>
                <Switch
                  value={drinkingHistory}
                  onValueChange={setDrinkingHistory}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={drinkingHistory ? '#4361ee' : '#f4f3f4'}
                />
              </View>
              {drinkingHistory && (
                <View>
                  <Text style={styles.inputLabel}>How many years?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3"
                    value={drinkingYears}
                    onChangeText={setDrinkingYears}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.push('./login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
    fontWeight: '500',
  },
  requiredStar: {
    color: 'red',
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007BFF',
    marginRight: 5,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#007BFF',
  },
  radioOptionLabel: {
    fontSize: 14,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginLinkText: {
    color: '#007BFF',
    fontSize: 14,
  },
});