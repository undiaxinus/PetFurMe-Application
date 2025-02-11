require('dotenv').config();

const config = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pet-management',
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  production: {
    // Production settings will be similar
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

const env = process.env.NODE_ENV || 'development';
console.log(`Using ${env} database configuration`);
module.exports = config[env]; 