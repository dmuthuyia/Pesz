const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  if (err.code === '23502') { // Not null violation
    return res.status(400).json({ error: 'Required field missing' });
  }

  // Default error
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
};

module.exports = errorHandler;