const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Server configuration - declare these once at the top
const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log('=================================');
  console.log('Incoming Request:');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('=================================');
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database configuration
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pet-management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: db.pool ? 'connected' : 'disconnected'
  });
});

// Registration endpoint with password hashing
app.post('/api/register', async (req, res) => {
  const { name, email, password, username, phone, pet_name, pet_type, role } = req.body;
  
  try {
    console.log('Received registration request:', {
      name,
      email,
      username,
      role
    });

    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();

    // Insert user
    const result = await db.query(
      `INSERT INTO users (uuid, username, name, email, password, phone, pet_name, pet_type, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [uuid, username, name, email, hashedPassword, phone, pet_name, pet_type, role || 'pet_owner']
    );

    console.log('User registered successfully:', {
      id: result[0].insertId,
      email
    });

    res.json({
      success: true,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      success: false,
      error: error.sqlMessage || 'Registration failed. Please try again.'
    });
  }
});

// Login endpoint with bcrypt comparison
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [username, username]);
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Add this test endpoint to your server.js
app.post('/api/test-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = results[0];
      
      // Compare password
      const match = await bcrypt.compare(password, user.password);
      
      res.json({
        passwordMatches: match,
        hashedPassword: user.password,
        providedPassword: password
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add after line 71 in server.js
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    ip: req.ip
  });
  next();
});

const startServer = async () => {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Start the server
    app.listen(PORT, HOST, () => {
      console.log('=================================');
      console.log(`Server running on:`);
      console.log(`- Local: http://localhost:${PORT}`);
      console.log(`- Network: http://192.168.43.100:${PORT}`);
      console.log(`- Android: http://10.0.2.2:${PORT}`);
      console.log('Database Status: Connected');
      console.log('=================================');
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
