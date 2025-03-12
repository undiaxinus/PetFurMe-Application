import { Platform } from 'react-native';

// App-wide constants
export const SERVER_IP = Platform.select({
    ios: 'localhost',
    android: '10.0.2.2', // Special IP for Android emulator
    default: '192.168.224.1' // Your computer's IP for physical devices
});

export const SERVER_PORT = '3001';
export const BASE_URL = Platform.select({
    ios: `http://localhost:${SERVER_PORT}`,
    android: `http://10.0.2.2:${SERVER_PORT}`,
    default: `http://${SERVER_IP}:${SERVER_PORT}`
});
export const API_BASE_URL = `${BASE_URL}/api`;

// Debug logging
console.log('Environment Setup:', {
    platform: Platform.OS,
    serverIP: SERVER_IP,
    baseURL: BASE_URL,
    apiBaseURL: API_BASE_URL
});

// Add other app constants here 