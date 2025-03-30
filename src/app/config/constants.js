import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Single source of truth for API URL construction
export const SERVER_CONFIGS = {
  production: {
    name: 'Production',
    ip: 'app.petfurme.shop',
    port: 443,
    https: true,
    // This should match the server structure
    apiPath: 'PetFurMe-Application/api'
  },
  auth: {
    name: 'Auth Server',
    ip: 'app.petfurme.shop',
    port: 1800,  // Node.js server port
    https: false,
    apiPath: '/api'
  },
  development: {
    name: 'Development',
    ip: '192.168.1.100', // Your development IP
    port: 8080,
    https: false,
    apiPath: '/api'
  },
  localhost: {
    name: 'Localhost',
    ip: Platform.select({
      ios: 'localhost',
      android: '10.0.2.2',
      web: 'localhost'
    }),
    port: 3000, // Common local development port
    https: false,
    apiPath: '/api'
  }
};

// Use production by default
const CURRENT_SERVER = 'production';
const SERVER_CONFIG = SERVER_CONFIGS[CURRENT_SERVER];

// Export constants
export const SERVER_IP = SERVER_CONFIG.ip;
export const SERVER_PORT = SERVER_CONFIG.port;
export const SERVER_PORT_PROD = '1800';
export const SERVER_PORT_DEV = '1800';
export const API_VERSION = 'v1';
export const USE_HTTPS = SERVER_CONFIG.https;

// Construct base URLs correctly
export const BASE_URL = `${USE_HTTPS ? 'https' : 'http'}://${SERVER_IP}`;
export const API_BASE_URL = 'https://app.petfurme.shop/PetFurMe-Application/api';

// For local development, you might want to use different URLs
export const DEV_BASE_URL = Platform.select({
  ios: `http://localhost:${SERVER_PORT_DEV}`,
  android: `http://10.0.2.2:${SERVER_PORT_DEV}`,
  web: `http://localhost:${SERVER_PORT_DEV}`
});

// You can add a flag to switch between production and development
export const IS_DEVELOPMENT = __DEV__;

// Use the appropriate URL based on environment
export const EFFECTIVE_BASE_URL = IS_DEVELOPMENT ? DEV_BASE_URL : BASE_URL;
export const EFFECTIVE_API_URL = IS_DEVELOPMENT ? `${DEV_BASE_URL}/api` : API_BASE_URL;

// Allow changing server at runtime
export const changeServer = async (serverKey) => {
  if (SERVER_CONFIGS[serverKey]) {
    CURRENT_SERVER = serverKey;
    SERVER_CONFIG = SERVER_CONFIGS[serverKey];
    
    // Save the selection for next app start
    try {
      await AsyncStorage.setItem('activeServer', serverKey);
    } catch (e) {
      console.error('Failed to save server selection:', e);
    }
    
    // Update the URLs
    Object.defineProperty(global, 'SERVER_IP', { value: SERVER_CONFIG.ip });
    Object.defineProperty(global, 'SERVER_PORT', { value: SERVER_CONFIG.port });
    Object.defineProperty(global, 'BASE_URL', { 
      value: `${USE_HTTPS ? 'https' : 'http'}://${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}` 
    });
    
    console.log('Server changed to:', serverKey, {
      ip: SERVER_CONFIG.ip,
      port: SERVER_CONFIG.port,
      url: `${USE_HTTPS ? 'https' : 'http'}://${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}`
    });
    
    return true;
  }
  return false;
};

// Remove the auto-loading of server configuration for production
// Only run the server selection loader in development mode
if (__DEV__) {
  (async () => {
    try {
      const savedServer = await AsyncStorage.getItem('activeServer');
      if (savedServer && SERVER_CONFIGS[savedServer]) {
        changeServer(savedServer);
      }
    } catch (e) {
      console.log('No saved server found, using default');
    }
  })();
}

// Debug logging to help identify connection issues
if (__DEV__) {
  console.log('Environment Config:', {
    serverIP: SERVER_IP,
    serverPort: SERVER_PORT,
    baseURL: BASE_URL,
    apiBaseURL: API_BASE_URL,
    isDev: __DEV__
  });
}

// Add other app constants here 

// Add this function to test connectivity
export const checkServerConnectivity = async () => {
  try {
    // First try the main website to see if it's reachable
    const protocol = SERVER_PORT === 443 ? 'https' : 'http';
    const baseUrl = `${protocol}://${SERVER_IP}${(SERVER_PORT !== 80 && SERVER_PORT !== 443) ? `:${SERVER_PORT}` : ''}`;
    
    console.log(`Testing connectivity to ${baseUrl}`);
    const start = Date.now();
    
    // Try to reach the main site first with no-cors mode for web platform
    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      mode: Platform.OS === 'web' ? 'no-cors' : undefined,
      cache: 'no-cache',
      headers: {
        'Accept': 'text/html,application/json',
      }
    });
    
    const elapsed = Date.now() - start;
    console.log(`Server responded in ${elapsed}ms with status: ${response.status}`);
    
    return {
      success: true,  // With no-cors we can't check response.ok
      responseTime: elapsed
    };
  } catch (error) {
    console.error('Connectivity test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add this function to handle the "Standard HTTPS" option
export const useStandardHTTPS = () => {
  // Custom server change for standard HTTPS
  CURRENT_SERVER = 'standard';
  const config = {
    ip: 'app.petfurme.shop',
    port: 443,
    https: true,
    apiPath: '/PetFurMe-Application/api'
  };
  
  Object.defineProperty(global, 'SERVER_IP', { value: config.ip });
  Object.defineProperty(global, 'SERVER_PORT', { value: config.port });
  Object.defineProperty(global, 'BASE_URL', { value: `https://${config.ip}` });
  Object.defineProperty(global, 'API_BASE_URL', { value: `https://${config.ip}${config.apiPath}` });
  
  console.log('Switched to HTTPS:', {
    baseUrl: `https://${config.ip}`,
    apiUrl: `https://${config.ip}${config.apiPath}`
  });
  
  return true;
};

// Add a helper function for API URLs
export const getApiUrl = (endpoint, params = {}) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const baseUrl = `${API_BASE_URL}/${cleanEndpoint}`;
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Add constants for auth server
export const AUTH_BASE_URL = `http://app.petfurme.shop:1800`;
export const AUTH_API_URL = `${AUTH_BASE_URL}/api`;

// Add a helper function for auth endpoints
export const getAuthUrl = (endpoint) => {
  return `${AUTH_API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}; 