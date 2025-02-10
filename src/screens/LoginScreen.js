import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      let apiUrl;
      try {
        // Get and verify base URL
        const baseUrl = await API_CONFIG.getBaseUrl();
        console.log('Base URL:', baseUrl);
        
        if (!baseUrl) {
          throw new Error('Could not determine server address');
        }
        
        // Update the login endpoint to match your PHP file
        apiUrl = `${baseUrl}/api/auth/login.php`;
        console.log('Login URL:', apiUrl);
      } catch (e) {
        console.error('URL Resolution Error:', e);
        throw new Error('Could not connect to server. Please check your network connection.');
      }

      // Attempt login
      const response = await axios.post(
        apiUrl,
        { email, password },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Login response:', response.data);

      if (response.data.success) {
        navigation.navigate('HomePage', { user_id: response.data.user_id });
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      if (!error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Your existing UI components */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
}); 