import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Development configuration
const DEV_CONFIG = {
  // For web development
  WEB: 'http://localhost/PetFurMe-Application',
  
  // For mobile development
  // Empty string means it will use the current device's network
  MOBILE: '',
  
  // API paths
  API_PATH: '/api',
  UPLOADS_PATH: '/uploads'
};

// Production configuration 
const PROD_CONFIG = {
  // Production URL (update this when deploying)
  WEB: process.env.REACT_APP_API_URL,
  MOBILE: process.env.REACT_APP_MOBILE_API_URL,
  API_PATH: '/api',
  UPLOADS_PATH: '/uploads'
};

// Select configuration based on environment
const CONFIG = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

const getServerIP = async () => {
  try {
    // For web platform
    if (Platform.OS === 'web') {
      return window.location.hostname;
    }

    const networkInfo = await NetInfo.fetch();
    console.log('Network Info:', networkInfo);

    // For Android Emulator
    if (Platform.OS === 'android' && networkInfo.isEmulator) {
      return '10.0.2.2';
    }

    // For iOS Simulator
    if (Platform.OS === 'ios' && networkInfo.isEmulator) {
      return 'localhost';
    }

    // For real devices on WiFi
    if (networkInfo.type === 'wifi' && networkInfo.details?.ipAddress) {
      // Try to find the server on the network
      const deviceIP = networkInfo.details.ipAddress;
      const subnet = deviceIP.split('.').slice(0, 3).join('.');
      
      // Try common local IPs
      const possibleIPs = [
        'localhost',
        `${subnet}.1`,
        `${subnet}.100`,
        `${subnet}.254`,
        deviceIP
      ];

      for (const ip of possibleIPs) {
        try {
          const response = await fetch(`http://${ip}/PetFurMe-Application/api/test.php`, {
            timeout: 1000
          });
          if (response.ok) {
            console.log('Server found at:', ip);
            return ip;
          }
        } catch (e) {
          console.log('No server at:', ip);
        }
      }
    }

    // Fallback to localhost
    return 'localhost';
  } catch (error) {
    console.error('Error in getServerIP:', error);
    return 'localhost';
  }
};

const getBaseUrl = async () => {
  if (Platform.OS === 'web') {
    return CONFIG.WEB;
  }
  
  // For mobile apps, use the device's network if no specific URL is set
  if (!CONFIG.MOBILE) {
    const serverIP = await getServerIP();
    console.log('Server IP:', serverIP);
    if (Platform.OS === 'android') {
      return `http://${serverIP}`;
    }
    return `http://${serverIP}`;
  }
  
  return CONFIG.MOBILE;
};

export const API_CONFIG = {
  async getBaseUrl() {
    try {
      const serverIP = await getServerIP();
      console.log('Resolved server IP:', serverIP);
      const baseUrl = `http://${serverIP}/PetFurMe-Application`;
      
      // Verify the connection
      try {
        const response = await fetch(`${baseUrl}/api/test.php`);
        if (!response.ok) throw new Error('Server health check failed');
        console.log('Server health check passed');
      } catch (e) {
        console.error('Server health check failed:', e);
        throw new Error('Could not connect to server');
      }
      
      return baseUrl;
    } catch (error) {
      console.error('Error in getBaseUrl:', error);
      throw error;
    }
  },

  async getApiUrl(path) {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}/api${path}`;
  },

  async getUploadsUrl(path = '') {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}${DEV_CONFIG.UPLOADS_PATH}${path}`;
  }
}; 