import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Server configurations - allows switching between servers
export const SERVER_CONFIGS = {
  production: {
    name: 'Production',
    ip: 'app.petfurme.shop',
    port: 443,  // HTTPS port
    https: true,
    apiPath: '/PetFurMe-Application/api'
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
    ip: '192.168.1.100', // Replace with your actual development IP
    port: 8080, // Common development port
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

// Default to production if no server is selected
let activeServer = 'production';

// Production server details
export const SERVER_IP = SERVER_CONFIGS[activeServer].ip;
export const SERVER_PORT = SERVER_CONFIGS[activeServer].port;
export const SERVER_PORT_PROD = '1800';
export const SERVER_PORT_DEV = '1800';
export const API_VERSION = 'v1';

// Determine the right URL format based on platform and environment
export const BASE_URL = `${SERVER_CONFIGS[activeServer]?.https || SERVER_PORT === 443 ? 'https' : 'http'}://${SERVER_IP}${(SERVER_PORT !== 80 && SERVER_PORT !== 443) ? `:${SERVER_PORT}` : ''}`;
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
    activeServer = serverKey;
    
    // Save the selection for next app start
    try {
      await AsyncStorage.setItem('activeServer', serverKey);
    } catch (e) {
      console.error('Failed to save server selection:', e);
    }
    
    // Update the URLs
    Object.defineProperty(global, 'SERVER_IP', { value: SERVER_CONFIGS[serverKey].ip });
    Object.defineProperty(global, 'SERVER_PORT', { value: SERVER_CONFIGS[serverKey].port });
    Object.defineProperty(global, 'BASE_URL', { 
      value: `${SERVER_CONFIGS[serverKey].https ? 'https' : 'http'}://${SERVER_CONFIGS[serverKey].ip}:${SERVER_CONFIGS[serverKey].port}` 
    });
    
    console.log('Server changed to:', serverKey, {
      ip: SERVER_CONFIGS[serverKey].ip,
      port: SERVER_CONFIGS[serverKey].port,
      url: `${SERVER_CONFIGS[serverKey].https ? 'https' : 'http'}://${SERVER_CONFIGS[serverKey].ip}:${SERVER_CONFIGS[serverKey].port}`
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
  activeServer = 'standard';
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

// Add a helper function to get the full API URL with endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

// Add constants for auth server
export const AUTH_BASE_URL = `http://app.petfurme.shop:1800`;
export const AUTH_API_URL = `${AUTH_BASE_URL}/api`;

// Add a helper function for auth endpoints
export const getAuthUrl = (endpoint) => {
  return `${AUTH_API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}; 