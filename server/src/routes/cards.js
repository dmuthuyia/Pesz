const express = require('express');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');
const { validateCard } = require('../validators/card');

const router = express.Router();

// Add new card
router.post('/', auth, async (req, res) => {
  try {
    const { error } = validateCard(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { cardNumber, cardHolderName, expiryMonth, expiryYear, cardType } = req.body;
    const userId = req.user.userId;

    // Check if this is the user's first card
    const existingCards = await pool.query(
      'SELECT COUNT(*) as count FROM cards WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    const isDefault = existingCards.rows[0].count === '0';

    // Mask card number for storage (in production, use proper encryption)
    const maskedCardNumber = cardNumber.slice(-4).padStart(cardNumber.length, '*');

    const result = await pool.query(
      `INSERT INTO cards (user_id, card_number, card_holder_name, expiry_month, 
                         expiry_year, card_type, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, card_number, card_holder_name, expiry_month, expiry_year, 
                 card_type, is_default, created_at`,
      [userId, maskedCardNumber, cardHolderName, expiryMonth, expiryYear, cardType, isDefault]
    );

    const card = result.rows[0];
    res.status(201).json({
      message: 'Card added successfully',
      card: {
        id: card.id,
        cardNumber: card.card_number,
        cardHolderName: card.card_holder_name,
        expiryMonth: card.expiry_month,
        expiryYear: card.expiry_year,
        cardType: card.card_type,
        isDefault: card.is_default,
        createdAt: card.created_at
      }
    });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's cards
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, card_number, card_holder_name, expiry_month, expiry_year, 
              card_type, is_default, created_at
       FROM cards 
       WHERE user_id = $1 AND is_active = true
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    const cards = result.rows.map(card => ({
      id: card.id,
      cardNumber: card.card_number,
      cardHolderName: card.card_holder_name,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cardType: card.card_type,
      isDefault: card.is_default,
      createdAt: card.created_at
    }));

    res.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set default card
router.put('/:id/default', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await client.query('BEGIN');

    // Check if card belongs to user
    const cardResult = await client.query(
      'SELECT id FROM cards WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, userId]
    );

    if (cardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }

    // Remove default from all user's cards
    await client.query(
      'UPDATE cards SET is_default = false WHERE user_id = $1',
      [userId]
    );

    // Set new default card
    await client.query(
      'UPDATE cards SET is_default = true WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Default card updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Set default card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Delete card
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'UPDATE cards SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;