const os = require('os');

// Function to get all network interfaces
const getNetworkInterfaces = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        addresses.push(addr.address);
      }
    }
  }
  
  return addresses;
};

module.exports = {
    PORT: process.env.PORT || 3001,
    
    // Get host from environment or use 0.0.0.0 to listen on all interfaces
    HOST: process.env.HOST || '0.0.0.0',
    
    NETWORK_INTERFACES: getNetworkInterfaces(),
    
    // Database config should come from environment variables
    DB_CONFIG: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pet-management'
    }
}; 