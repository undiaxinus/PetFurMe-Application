import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = Platform.select({
    ios: 'http://localhost:3001',
    android: 'http://192.168.0.108:3001'
  });

  // Add debug logging
  console.log('Using API URL:', API_URL);

  // Update axios configuration
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Add connection test
  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${API_URL}/health`);
      const response = await axiosInstance.get('/health');
      console.log('Connection test response:', response.data);
      return true;
    } catch (error) {
      console.error('Connection test failed:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
      return false;
    }
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        setError('Cannot connect to server. Please check your connection.');
        return;
      }

      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Password strength validation (minimum 6 characters)
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Log the request details
      console.log('Sending registration request to:', `${API_URL}/api/register`);
      console.log('Request data:', {
        name,
        email,
        password,
        username: email.split('@')[0],
        phone: null,
        pet_name: null,
        pet_type: null,
        role: 'pet_owner'
      });

      const response = await axiosInstance.post('/api/register', {
        name,
        email,
        password,
        username: email.split('@')[0],
        phone: null,
        pet_name: null,
        pet_type: null,
        role: 'pet_owner'
      });

      console.log('Registration response:', response.data); // Add this for debugging

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Registration successful! Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen') }]
        );
      } else {
        // If the server returns an error message
        setError(response.data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error.response || error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this for debugging connection issues
  const checkServerConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      console.log('Server health check:', response.data);
    } catch (error) {
      console.error('Server health check failed:', error.message);
    }
  };

  // Call this when component mounts
  useEffect(() => {
    checkServerConnection();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/images/vetcare.png')} // Replace with your logo path
          style={styles.logo}
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#8146C1"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#8146C1"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#8146C1"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#8146C1"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#8146C1"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#8146C1"
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={[
            styles.signupButton,
            isLoading && styles.disabledButton
          ]} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.loginText}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            Log in now
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Changed to white
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
    bottom: 30,
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#D1ACDA',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: 430,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8146C1',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8146C1',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: 120,
    height: 30,
    left: 80,
    top: 30,
  },
  signupButtonText: {
    color: '#8146C1',
    fontSize: 16,
    fontWeight: 'bold',
    top: -10,
    height: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#000000',
    marginTop: 55,
  },
  loginText: {
    color: '#8146C1',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default SignupScreen;
