const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, profile_picture, 
              balance, is_verified, created_at
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
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone } = req.body;

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE phone = $1 AND id != $2',
        [phone, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, phone, first_name, last_name, profile_picture, balance, is_verified`,
      [firstName, lastName, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        balance: user.balance,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE users 
       SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING profile_picture`,
      [profilePicturePath, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: result.rows[0].profile_picture
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users by email or phone
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, profile_picture
       FROM users 
       WHERE (email ILIKE $1 OR phone ILIKE $1 OR 
              CONCAT(first_name, ' ', last_name) ILIKE $1)
       AND id != $2 AND is_active = true
       LIMIT 10`,
      [`%${query}%`, userId]
    );

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: `${user.first_name} ${user.last_name}`,
      profilePicture: user.profile_picture
    }));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user balance
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;