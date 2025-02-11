// App-wide constants
const SERVER_IP = '192.168.1.5';  // Your server IP
const SERVER_PORT = 3001;         // Your server port
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

export {
    SERVER_IP,
    SERVER_PORT,
    BASE_URL
};

export const API_BASE_URL = `${BASE_URL}/api`;

// Add other app constants here 