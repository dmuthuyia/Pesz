const express = require('express');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');
const { validateTransaction } = require('../validators/transaction');
const { generateReferenceNumber } = require('../utils/helpers');

const router = express.Router();

// Send money
router.post('/send', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { error } = validateTransaction(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { receiverEmail, amount, description, pin } = req.body;
    const senderId = req.user.userId;

    await client.query('BEGIN');

    // Verify PIN if provided
    if (pin) {
      const pinResult = await client.query(
        'SELECT pin_hash FROM users WHERE id = $1',
        [senderId]
      );
      
      if (pinResult.rows.length === 0 || !pinResult.rows[0].pin_hash) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'PIN not set up' });
      }

      const bcrypt = require('bcryptjs');
      const isValidPin = await bcrypt.compare(pin, pinResult.rows[0].pin_hash);
      if (!isValidPin) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }

    // Get sender details
    const senderResult = await client.query(
      'SELECT id, first_name, last_name, balance FROM users WHERE id = $1',
      [senderId]
    );

    if (senderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sender not found' });
    }

    const sender = senderResult.rows[0];

    // Check if sender has sufficient balance
    if (parseFloat(sender.balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get receiver details
    const receiverResult = await client.query(
      'SELECT id, first_name, last_name FROM users WHERE email = $1 AND is_active = true',
      [receiverEmail]
    );

    if (receiverResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const receiver = receiverResult.rows[0];

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type, 
                                status, description, reference_number)
       VALUES ($1, $2, $3, 'transfer', 'completed', $4, $5)
       RETURNING *`,
      [senderId, receiver.id, amount, description, referenceNumber]
    );

    // Update sender balance
    await client.query(
      'UPDATE users SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, senderId]
    );

    // Update receiver balance
    await client.query(
      'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, receiver.id]
    );

    // Create notifications
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Money Sent', $2, 'transaction')`,
      [senderId, `You sent $${amount} to ${receiver.first_name} ${receiver.last_name}`]
    );

    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Money Received', $2, 'transaction')`,
      [receiver.id, `You received $${amount} from ${sender.first_name} ${sender.last_name}`]
    );

    await client.query('COMMIT');

    const transaction = transactionResult.rows[0];
    res.json({
      message: 'Money sent successfully',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        referenceNumber: transaction.reference_number,
        receiver: {
          name: `${receiver.first_name} ${receiver.last_name}`,
          email: receiverEmail
        },
        createdAt: transaction.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Send money error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get transaction history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, 
             sender.first_name as sender_first_name, sender.last_name as sender_last_name,
             receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name
      FROM transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
      WHERE (t.sender_id = $1 OR t.receiver_id = $1)
    `;

    const params = [userId];

    if (type) {
      query += ` AND t.transaction_type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const transactions = result.rows.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.transaction_type,
      status: transaction.status,
      description: transaction.description,
      referenceNumber: transaction.reference_number,
      isIncoming: transaction.receiver_id === userId,
      otherParty: transaction.sender_id === userId 
        ? `${transaction.receiver_first_name} ${transaction.receiver_last_name}`
        : `${transaction.sender_first_name} ${transaction.sender_last_name}`,
      createdAt: transaction.created_at
    }));

    res.json({ transactions });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT t.*, 
              sender.first_name as sender_first_name, sender.last_name as sender_last_name,
              sender.email as sender_email,
              receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
              receiver.email as receiver_email
       FROM transactions t
       LEFT JOIN users sender ON t.sender_id = sender.id
       LEFT JOIN users receiver ON t.receiver_id = receiver.id
       WHERE t.id = $1 AND (t.sender_id = $2 OR t.receiver_id = $2)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = result.rows[0];
    res.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.transaction_type,
        status: transaction.status,
        description: transaction.description,
        referenceNumber: transaction.reference_number,
        sender: {
          name: `${transaction.sender_first_name} ${transaction.sender_last_name}`,
          email: transaction.sender_email
        },
        receiver: {
          name: `${transaction.receiver_first_name} ${transaction.receiver_last_name}`,
          email: transaction.receiver_email
        },
        isIncoming: transaction.receiver_id === userId,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });
  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Top up balance (placeholder for payment gateway integration)
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, cardId } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // In a real implementation, you would integrate with a payment gateway here
    // For now, we'll simulate a successful top-up

    const referenceNumber = generateReferenceNumber();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO transactions (receiver_id, amount, transaction_type, 
                                  status, description, reference_number)
         VALUES ($1, $2, 'topup', 'completed', 'Account top-up', $3)
         RETURNING *`,
        [userId, amount, referenceNumber]
      );

      // Update user balance
      await client.query(
        'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [amount, userId]
      );

      // Create notification
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Account Topped Up', $2, 'transaction')`,
        [userId, `Your account has been topped up with $${amount}`]
      );

      await client.query('COMMIT');

      const transaction = transactionResult.rows[0];
      res.json({
        message: 'Top-up successful',
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          referenceNumber: transaction.reference_number,
          createdAt: transaction.created_at
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;