const express = require('express');
const QRCode = require('qrcode');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate QR code for receiving money
router.post('/generate', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.userId;

    // Get user details
    const userResult = await pool.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Create QR data
    const qrData = JSON.stringify({
      type: 'payment_request',
      userId: userId,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      amount: amount || null,
      description: description || null,
      timestamp: new Date().toISOString()
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Store QR code in database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const result = await pool.query(
      `INSERT INTO qr_codes (user_id, qr_data, qr_type, expires_at)
       VALUES ($1, $2, 'payment_request', $3)
       RETURNING id, created_at`,
      [userId, qrData, expiresAt]
    );

    const qrRecord = result.rows[0];

    res.json({
      qrCode: {
        id: qrRecord.id,
        image: qrCodeImage,
        data: qrData,
        amount: amount,
        description: description,
        expiresAt: expiresAt,
        createdAt: qrRecord.created_at
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scan and process QR code
router.post('/scan', auth, async (req, res) => {
  try {
    const { qrData } = req.body;
    const userId = req.user.userId;

    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    if (parsedData.type !== 'payment_request') {
      return res.status(400).json({ error: 'Invalid QR code type' });
    }

    // Check if user is trying to scan their own QR code
    if (parsedData.userId === userId) {
      return res.status(400).json({ error: 'Cannot scan your own QR code' });
    }

    // Get recipient details
    const recipientResult = await pool.query(
      'SELECT id, email, first_name, last_name, profile_picture FROM users WHERE id = $1 AND is_active = true',
      [parsedData.userId]
    );

    if (recipientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const recipient = recipientResult.rows[0];

    res.json({
      recipient: {
        id: recipient.id,
        email: recipient.email,
        name: `${recipient.first_name} ${recipient.last_name}`,
        profilePicture: recipient.profile_picture
      },
      amount: parsedData.amount,
      description: parsedData.description,
      timestamp: parsedData.timestamp
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's QR codes
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, qr_data, qr_type, expires_at, is_active, created_at
       FROM qr_codes
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    const qrCodes = result.rows.map(qr => {
      let parsedData = {};
      try {
        parsedData = JSON.parse(qr.qr_data);
      } catch (error) {
        console.error('Error parsing QR data:', error);
      }

      return {
        id: qr.id,
        type: qr.qr_type,
        amount: parsedData.amount,
        description: parsedData.description,
        expiresAt: qr.expires_at,
        isActive: qr.is_active && new Date() < new Date(qr.expires_at),
        createdAt: qr.created_at
      };
    });

    res.json({ qrCodes });
  } catch (error) {
    console.error('Get QR history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;