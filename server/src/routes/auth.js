const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');
const { validateRegistration, validateLogin, validatePinSetup } = require('../validators/auth');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, phone, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phone, first_name, last_name, balance, created_at`,
      [email, phone, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        balance: user.balance,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        balance: user.balance,
        profilePicture: user.profile_picture,
        hasPin: !!user.pin_hash,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup PIN
router.post('/setup-pin', auth, async (req, res) => {
  try {
    const { error } = validatePinSetup(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { pin } = req.body;
    const userId = req.user.userId;

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 12);

    // Update user with PIN
    await pool.query(
      'UPDATE users SET pin_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [pinHash, userId]
    );

    res.json({ message: 'PIN setup successful' });
  } catch (error) {
    console.error('PIN setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify PIN
router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.userId;

    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Get user's PIN hash
    const result = await pool.query(
      'SELECT pin_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].pin_hash) {
      return res.status(400).json({ error: 'PIN not set up' });
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, result.rows[0].pin_hash);
    if (!isValidPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, profile_picture, 
              balance, is_verified, created_at, pin_hash IS NOT NULL as has_pin
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        balance: user.balance,
        isVerified: user.is_verified,
        hasPin: user.has_pin,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;