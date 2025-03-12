import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update API URL configuration to match your server setup
  const API_URL = Platform.select({
    ios: 'http://localhost:3001',
    android: `http://${SERVER_IP}:${SERVER_PORT}`,
    web: BASE_URL || `http://${SERVER_IP}:${SERVER_PORT}`
  });

  // Add debug logging
  useEffect(() => {
    console.log('ForgotPasswordScreen initialized with API_URL:', API_URL);
    console.log('Environment:', {
      Platform: Platform.OS,
      SERVER_IP,
      SERVER_PORT,
      BASE_URL
    });
  }, []);

  // Create axios instance with proper configuration
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError('');

      if (!email) {
        setError('Please enter your email address');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      console.log('Sending email verification request to:', `${API_URL}/api/verify-email`);
      
      // First, verify if the email exists
      const verifyResponse = await axiosInstance.post('/api/verify-email', {
        email: email.trim()
      });

      console.log('Email verification response:', verifyResponse.data);

      if (!verifyResponse.data.exists) {
        setError('Email address not found. Please check your email or register.');
        return;
      }

      // If email exists, proceed with sending OTP
      console.log('Sending OTP request to:', `${API_URL}/api/send-otp`);
      
      const response = await axiosInstance.post('/api/send-otp', {
        email: email.trim()
      });

      console.log('OTP request response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'OTP Sent',
          'A verification code has been sent to your email address.',
          [{ text: 'OK' }]
        );
        setStep(2);
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Connection timed out. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError(`Network error. Please check if the server is running at ${SERVER_IP}:${SERVER_PORT}`);
      } else {
        setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError('');

      if (!otp) {
        setError('Please enter the OTP');
        return;
      }

      console.log('Sending OTP verification request to:', `${API_URL}/api/verify-otp`);
      console.log('OTP verification data:', {
        email,
        otp: otp.trim()
      });

      const response = await axiosInstance.post('/api/verify-otp', {
        email,
        otp: otp.trim()
      });

      console.log('OTP verification response:', response.data);

      if (response.data.success) {
        setStep(3);
      } else {
        setError(response.data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Connection timed out. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError(`Network error. Please check if the server is running at ${SERVER_IP}:${SERVER_PORT}`);
      } else {
        setError(error.response?.data?.error || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');

      if (!newPassword || !confirmPassword) {
        setError('Please enter both passwords');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Password strength validation (minimum 6 characters)
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      console.log('Sending reset password request to:', `${API_URL}/api/reset-password`);
      console.log('Reset password data:', {
        email,
        hasPassword: !!newPassword
      });

      const response = await axiosInstance.post('/api/reset-password', {
        email: email.trim(),
        newPassword
      });
      
      console.log('Reset password response:', response.data);

      if (response.data.success) {
        setLoading(false);
        
        // Directly navigate to login screen without alert
        navigation.navigate('LoginScreen');
        return;
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (error) {
      // Error handling remains the same
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.headerText}>Forgot Password</Text>
            <Text style={styles.descriptionText}>
              Enter your email address to receive a verification code
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#8146C1"
                autoCapitalize="none"
              />
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.headerText}>Enter OTP</Text>
            <Text style={styles.descriptionText}>
              Please enter the verification code sent to your email
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholderTextColor="#8146C1"
              />
            </View>
            <TouchableOpacity onPress={handleSendOTP} style={styles.resendLink}>
              <Text style={styles.resendText}>Didn't receive code? Resend OTP</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.headerText}>Reset Password</Text>
            <Text style={styles.descriptionText}>
              Enter your new password
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
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
          </>
        );
    }
  };

  const handleActionButton = () => {
    switch (step) {
      case 1:
        return handleSendOTP();
      case 2:
        return handleVerifyOTP();
      case 3:
        return handleResetPassword();
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 1:
        return 'Send OTP';
      case 2:
        return 'Verify OTP';
      case 3:
        return 'Reset Password';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/vetcare.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.formContainer}>
        {renderStep()}
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity
          style={[styles.actionButton, loading && styles.disabledButton]}
          onPress={handleActionButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      {step > 1 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(step - 1)}
        >
          <Ionicons name="arrow-back" size={24} color="#8146C1" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
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
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8146C1',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
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
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8146C1',
  },
  actionButton: {
    backgroundColor: '#8146C1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: 10,
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: -10,
    marginBottom: 15,
  },
  resendText: {
    color: '#8146C1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backToLoginButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backToLoginText: {
    color: '#8146C1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#8146C1',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default ForgotPasswordScreen;