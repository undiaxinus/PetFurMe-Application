import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Function to get the server IP dynamically
const getServerIP = async () => {
  if (Platform.OS === 'web') {
    // For web development, always use localhost
    return 'localhost';
  }

  const networkInfo = await NetInfo.fetch();
  
  if (Platform.OS === 'android' && networkInfo.isEmulator) {
    return '10.0.2.2';
  }

  // Default to localhost
  return 'localhost';
};

// Export as async functions
export const getApiConfig = async () => {
  const serverIP = await getServerIP();
  const config = {
    SERVER_IP: serverIP,
    SERVER_PORT: '80',
    // Always use the non-port version for API calls since XAMPP runs on default port 80
    API_BASE_URL: 'http://localhost',
    API_PATH: '/PetFurMe-Application/api',
    UPLOADS_PATH: '/uploads'
  };
  
  console.log('API Config:', config);
  return config;
}; 