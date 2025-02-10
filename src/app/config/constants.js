import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Helper function to get server IP
const getServerIP = async () => {
  if (Platform.OS === 'web') {
    return window.location.hostname;
  }
  
  const networkInfo = await NetInfo.fetch();
  
  // For Android emulator
  if (Platform.OS === 'android' && networkInfo.isEmulator) {
    return '10.0.2.2';
  }

  // For iOS simulator
  if (Platform.OS === 'ios' && networkInfo.isEmulator) {
    return 'localhost';
  }

  return 'localhost'; // Fallback
};

// Export as async functions instead of constants
export const getBaseUrl = async () => {
  const serverIP = await getServerIP();
  return `http://${serverIP}:3001`;
};

export const getApiBaseUrl = async () => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/api`;
};

// For backward compatibility
export const SERVER_PORT = '3001';

// Export a function to get the full URL for a specific endpoint
export const getApiUrl = async (endpoint) => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Add other app constants here 