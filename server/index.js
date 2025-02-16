const express = require('express');
const cors = require('cors');
const appointmentsRouter = require('./routes/appointments');

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

app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Register the appointments router with /api prefix
app.use('/api', appointmentsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`Full URL: http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`API endpoint example: http://localhost:${PORT}/api/user/appointments/108`);
}); 