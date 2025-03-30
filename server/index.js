const express = require('express');
const cors = require('cors');
const appointmentsRouter = require('./routes/appointments');
const authRouter = require('./routes/auth');

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  next();
});

app.use(cors({
  origin: '*', // In production, you should restrict this
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Register the appointments router with /api prefix
app.use('/api', appointmentsRouter);

// Mount the auth router at /api/auth
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 1800;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`Full URL: http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Auth endpoint: http://localhost:${PORT}/api/auth/test-auth`);
}); 