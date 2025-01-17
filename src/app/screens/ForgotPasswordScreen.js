import React, { useState } from 'react';
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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = Platform.select({
    ios: 'http://localhost:3001',
    android: 'http://192.168.43.100:3001',
  });

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError('');

      if (!email) {
        setError('Please enter your email address');
        return;
      }

      // First, verify if the email exists
      const verifyResponse = await axios.post(`${API_URL}/api/verify-email`, {
        email: email.trim()
      });

      if (!verifyResponse.data.exists) {
        setError('Email address not found. Please check your email or register.');
        return;
      }

      // If email exists, proceed with sending OTP
      const response = await axios.post(`${API_URL}/api/send-otp`, {
        email: email.trim()
      });

      if (response.data.success) {
        setStep(2);
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
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

      console.log('Sending OTP verification request:', {
        email,
        otp
      });

      const response = await axios.post(`${API_URL}/api/verify-otp`, {
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
        response: error.response?.data
      });
      setError(error.response?.data?.error || 'Failed to verify OTP');
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

      console.log('Sending reset password request:', {
        email,
        hasPassword: !!newPassword
      });

      const response = await axios.post(`${API_URL}/api/reset-password`, {
        email: email.trim(),
        newPassword
      });

      console.log('Reset password response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Password has been reset successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('LoginScreen')
            }
          ]
        );
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to reset password');
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
                secureTextEntry={!showPassword}
                placeholderTextColor="#8146C1"
              />
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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {renderStep()}
        
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
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            navigation.goBack();
          }
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#D1ACDA',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8146C1',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8146C1',
    paddingVertical: 8,
  },
  actionButton: {
    backgroundColor: '#8146C1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
    alignSelf: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#8146C1',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ForgotPasswordScreen; 