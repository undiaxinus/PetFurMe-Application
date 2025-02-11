import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

// Add these constants at the top
export const DEFAULT_SERVER_IP = 'localhost';
export const DEFAULT_PORT = '3001';

// Add this at the top of the file
const DEFAULT_API_URL = 'http://localhost/PetFurMe-Application';

export const API_BASE_URL = (() => {
  // For development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2/PetFurMe-Application';
    }
    return DEFAULT_API_URL;
  }
  // For production
  return DEFAULT_API_URL;
})();

// Helper function to get server IP with better logging
const getServerIP = async () => {
  console.log('[getServerIP] Starting server IP resolution...');
  
  try {
    if (Platform.OS === 'web') {
      const hostname = window.location.hostname;
      console.log('[getServerIP] Web platform detected, using hostname:', hostname);
      return hostname;
    }
    
    const networkInfo = await NetInfo.fetch();
    console.log('[getServerIP] Network info:', networkInfo);
    
    if (!networkInfo.isConnected) {
      console.warn('[getServerIP] No network connection detected');
      throw new Error('No network connection');
    }
    
    // For Android emulator
    if (Platform.OS === 'android' && networkInfo.isEmulator) {
      console.log('[getServerIP] Android emulator detected, using 10.0.2.2');
      return '10.0.2.2';
    }

    // For iOS simulator
    if (Platform.OS === 'ios' && networkInfo.isEmulator) {
      console.log('[getServerIP] iOS simulator detected, using localhost');
      return 'localhost';
    }

    console.log('[getServerIP] Using default server IP:', DEFAULT_SERVER_IP);
    return DEFAULT_SERVER_IP;
  } catch (error) {
    console.error('[getServerIP] Error getting server IP:', error);
    return DEFAULT_SERVER_IP; // Fallback to default
  }
};

// Export as async functions with logging
export const getBaseUrl = async () => {
  try {
    const serverIP = await getServerIP();
    if (!serverIP) {
      throw new Error('Failed to get server IP');
    }
    
    const baseUrl = `http://${serverIP}:${DEFAULT_PORT}`;
    console.log('[getBaseUrl] Constructed base URL:', baseUrl);
    return baseUrl;
  } catch (error) {
    console.error('[getBaseUrl] Error getting base URL:', error);
    // Fallback URL
    const fallbackUrl = `http://${DEFAULT_SERVER_IP}:${DEFAULT_PORT}`;
    console.warn('[getBaseUrl] Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getApiBaseUrl = async () => {
  try {
    const baseUrl = await getBaseUrl();
    const apiUrl = `${baseUrl}/api`;
    console.log('[getApiBaseUrl] Constructed API base URL:', apiUrl);
    return apiUrl;
  } catch (error) {
    console.error('[getApiBaseUrl] Error getting API base URL:', error);
    // Fallback API URL
    const fallbackUrl = `http://${DEFAULT_SERVER_IP}:${DEFAULT_PORT}/api`;
    console.warn('[getApiBaseUrl] Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
  }
};

// For backward compatibility
export const SERVER_PORT = '3001';

// Update the getApiUrl function
export const getApiUrl = async (endpoint) => {
  try {
    logger.debug('constants', 'Constructing API URL for endpoint:', endpoint);
    
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }

    const fullUrl = `${API_BASE_URL}/api${endpoint}`;
    logger.debug('constants', 'Constructed API URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    logger.error('constants', 'Error constructing API URL:', error);
    return `${DEFAULT_API_URL}/api${endpoint}`; // Fallback
  }
};

// Add a new utility function to validate URLs
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    logger.error('validateUrl', 'Invalid URL:', { url, error });
    return false;
  }
};

// Add other app constants here 