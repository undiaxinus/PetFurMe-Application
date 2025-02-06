const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

// Move CORS middleware to the top
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'petmanagementt@gmail.com', // Replace with your Gmail
    pass: 'ajlwvhzglwasoqku' // Replace with your app-specific password
  }
});

// Verify if email exists
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    const connection = await mysql.createConnection(config);

    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.json({ exists: false });
    }

    res.json({ exists: true });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('Received verify-otp request:', {
      body: req.body,
      path: req.path,
      method: req.method,
      url: req.url
    });

    const { email, otp } = req.body;

    if (!email || !otp) {
      console.log('Missing required fields:', { email: !!email, otp: !!otp });
      return res.status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    const connection = await mysql.createConnection(config);

    try {
      // Log the actual values being checked
      console.log('Checking database with values:', {
        email: email.trim(),
        otp: otp.toString().trim()
      });

      const [rows] = await connection.execute(
        `SELECT * FROM password_resets 
         WHERE email = ? 
         AND otp = ?
         AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
        [email.trim(), otp.toString().trim()]
      );

      console.log('Database query result:', rows);

      if (rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid or expired OTP' 
        });
      }

      // If OTP is valid, clear it from the database
      await connection.execute(
        'DELETE FROM password_resets WHERE email = ?',
        [email.trim()]
      );

      res.json({ 
        success: true,
        message: 'OTP verified successfully'
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Detailed verify-otp error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify OTP. Please try again.' 
    });
  }
});

// Update the send-otp endpoint with better error handling
router.post('/send-otp', async (req, res) => {
    try {
        console.log('Received request to send OTP:', req.body);
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const connection = await mysql.createConnection(config);

        try {
            // Store OTP in database
            await connection.execute(
                'INSERT INTO password_resets (email, otp, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW()',
                [email.trim(), otp, otp]
            );

            // Send email with OTP
            const mailOptions = {
                from: 'petmanagementt@gmail.com',
                to: email.trim(),
                subject: 'Email Verification OTP',
                html: `
                    <h1>Email Verification</h1>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('Successfully sent OTP email to:', email.trim());

            res.json({ 
                success: true,
                message: 'OTP sent successfully'
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send OTP'
        });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    console.log('Reset password endpoint hit');
    console.log('Request body:', req.body);
    
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      console.log('Missing required fields:', { hasEmail: !!email, hasPassword: !!newPassword });
      return res.status(400).json({
        success: false,
        error: 'Email and new password are required'
      });
    }

    const connection = await mysql.createConnection(config);

    try {
      // First verify if user exists
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('Password hashed successfully');

      // Update the user's password
      const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email.trim()]
      );

      console.log('Password update result:', {
        affectedRows: result.affectedRows,
        email: email.trim()
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Failed to update password'
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Detailed reset password error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({
      success: false,
      error: 'Failed to reset password. Please try again.'
    });
  }
});

// Add this registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, role, name } = req.body;
        console.log('Received registration request for:', email);

        const connection = await mysql.createConnection(config);
        
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert the new user
            const [result] = await connection.execute(
                'INSERT INTO users (email, username, password, role, name) VALUES (?, ?, ?, ?, ?)',
                [email.trim(), username.trim(), hashedPassword, role, name]
            );

            console.log('User registered successfully:', result);

            res.json({
                success: true,
                message: 'Registration successful'
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to register user'
        });
    }
});

router.get('/test-auth', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

router.use((req, res, next) => {
  console.log('Auth route accessed:', {
    path: req.path,
    method: req.method,
    body: req.body
  });
  next();
});

module.exports = router; 