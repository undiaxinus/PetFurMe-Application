const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.sql) {
    // Database error
    return res.status(500).json({
      success: false,
      error: 'Database error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // General error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler; 