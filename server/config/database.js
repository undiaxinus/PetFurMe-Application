const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'u211529883_petfurme',
  password: '223Petfurme',
  database: 'u211529883_pet_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  debug: false,
  trace: false
});

// Test the database connection with a simple query
pool.getConnection()
  .then(async connection => {
    console.log('Database connected successfully');
    
    // Test query to verify connection and permissions
    try {
      const [result] = await connection.query('SELECT COUNT(*) as count FROM appointment');
      console.log('Total appointments in database:', result[0].count);
    } catch (err) {
      console.error('Error executing test query:', err);
    }
    
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
  });

module.exports = pool;