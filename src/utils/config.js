// Update these values according to your server configuration
export const SERVER_IP = '192.168.1.13';
export const SERVER_PORT = '3001'; // Make sure this matches your server port
export const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
export const API_URL = BASE_URL; // Use the same base URL for API
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://192.168.1.13:3001'
    : 'http://your-production-url'; 