const express = require('express');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's contacts
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT c.*, u.first_name, u.last_name, u.email, u.phone, u.profile_picture
       FROM contacts c
       JOIN users u ON c.contact_user_id = u.id
       WHERE c.user_id = $1
       ORDER BY c.is_favorite DESC, u.first_name ASC`,
      [userId]
    );

    const contacts = result.rows.map(contact => ({
      id: contact.id,
      contactUserId: contact.contact_user_id,
      name: contact.contact_name || `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      phone: contact.phone,
      profilePicture: contact.profile_picture,
      isFavorite: contact.is_favorite,
      createdAt: contact.created_at
    }));

    res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add contact
router.post('/', auth, async (req, res) => {
  try {
    const { contactEmail, contactName } = req.body;
    const userId = req.user.userId;

    if (!contactEmail) {
      return res.status(400).json({ error: 'Contact email is required' });
    }

    // Find the user to add as contact
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE email = $1 AND is_active = true',
      [contactEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contactUser = userResult.rows[0];

    // Check if contact already exists
    const existingContact = await pool.query(
      'SELECT id FROM contacts WHERE user_id = $1 AND contact_user_id = $2',
      [userId, contactUser.id]
    );

    if (existingContact.rows.length > 0) {
      return res.status(400).json({ error: 'Contact already exists' });
    }

    // Add contact
    const result = await pool.query(
      `INSERT INTO contacts (user_id, contact_user_id, contact_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, contactUser.id, contactName]
    );

    const contact = result.rows[0];
    res.status(201).json({
      message: 'Contact added successfully',
      contact: {
        id: contact.id,
        contactUserId: contact.contact_user_id,
        name: contact.contact_name || `${contactUser.first_name} ${contactUser.last_name}`,
        email: contactUser.email,
        phone: contactUser.phone,
        isFavorite: contact.is_favorite,
        createdAt: contact.created_at
      }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite contact
router.put('/:id/favorite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE contacts 
       SET is_favorite = NOT is_favorite
       WHERE id = $1 AND user_id = $2
       RETURNING is_favorite`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      message: 'Contact favorite status updated',
      isFavorite: result.rows[0].is_favorite
    });
  } catch (error) {
    console.error('Toggle favorite contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;