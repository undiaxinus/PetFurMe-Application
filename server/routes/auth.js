const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Export a function that takes db as parameter
module.exports = (db) => {
  // Create email transporter with more detailed configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true // Add this for debugging
  });

  // Add this after creating the transporter
  transporter.verify(function(error, success) {
    if (error) {
      console.log('Transporter verification error:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  // Add input validation middleware
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Verify if email exists
  router.post('/verify-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
      }

      // Check if email exists
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );

      res.json({
        success: true,
        exists: users.length > 0
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { error: 'Too many attempts, please try again later' }
  });

  // Verify OTP endpoint
  router.post('/verify-otp', authLimiter, async (req, res) => {
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

      const [rows] = await db.query(
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
      await db.query(
        'DELETE FROM password_resets WHERE email = ?',
        [email.trim()]
      );

      res.json({ 
        success: true,
        message: 'OTP verified successfully'
      });
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

      // Store OTP in database
      await db.query(
        'INSERT INTO password_resets (email, otp, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW()',
        [email.trim(), otp, otp]
      );

      // Send email with OTP
      const mailOptions = {
        from: {
          name: 'PetFurMe Support',
          address: process.env.EMAIL_USER
        },
        to: email.trim(),
        subject: 'Email Verification OTP',
        html: `
          <h1>Email Verification</h1>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };

      console.log('Attempting to send email with options:', {
        ...mailOptions,
        auth: '***hidden***'
      });

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);

      res.json({ 
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('Detailed send-otp error:', {
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

  const handleError = (error, res) => {
    console.error('Operation error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred'
    });
  };

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

      // Add password strength validation
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      // Add complexity check
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        });
      }

      // First verify if user exists
      const [users] = await db.query(
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
      const [result] = await db.query(
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
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Add this registration endpoint
  router.post('/register', async (req, res) => {
    try {
      const { email, username, password, role, name } = req.body;
      console.log('Received registration request for:', email);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert the new user
      const [result] = await db.query(
        'INSERT INTO users (email, username, password, role, name) VALUES (?, ?, ?, ?, ?)',
        [email.trim(), username.trim(), hashedPassword, role, name]
      );

      console.log('User registered successfully:', result);

      // After successful registration
      const token = jwt.sign(
        { userId: result.insertId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Registration successful',
        token
      });
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

  // Add this middleware to check verification status
  const checkVerification = async (req, res, next) => {
    try {
      const userId = req.user.id; // Assuming you have user info in req.user
      
      const [user] = await db.query(
        'SELECT verified_by FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user || !user[0]) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // If verified_by is greater than 0, user is verified
      const isVerified = parseInt(user[0].verified_by, 10) > 0;
      
      if (!isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account pending verification',
          requiresVerification: true
        });
      }
      
      next();
    } catch (error) {
      console.error('Verification check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking verification status'
      });
    }
  };

  // Use this middleware for protected routes that require verification
  router.use('/protected-route', checkVerification, (req, res) => {
    // Route handler
  });

  return router;
}; 