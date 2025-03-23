import { Platform } from 'react-native';

// App-wide constants
export const SERVER_IP = 'app.petfurme.shop';
export const SERVER_PORT = ''; // Leave empty for standard HTTPS port
export const BASE_URL = `https://${SERVER_IP}`;
export const API_BASE_URL = `${BASE_URL}/api`;

// Debug logging
console.log('Environment Setup:', {
    platform: Platform.OS,
    serverIP: SERVER_IP,
    baseURL: BASE_URL,
    apiBaseURL: API_BASE_URL
});

// Add other app constants here 