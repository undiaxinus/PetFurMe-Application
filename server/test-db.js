const mysql = require('mysql2/promise');
const config = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing connection with config:', {
      host: config.host,
      user: config.user,
      database: config.database
    });

    const connection = await mysql.createConnection(config);
    console.log('Connection successful!');

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', tables);

    await connection.end();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

testConnection(); 