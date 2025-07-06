const express = require('express');
const { pool } = require('../database/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get chat rooms for user
router.get('/rooms', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT DISTINCT cr.id, cr.name, cr.is_group, cr.created_at,
              (SELECT m.message_text FROM messages m 
               WHERE m.room_id = cr.id 
               ORDER BY m.created_at DESC LIMIT 1) as last_message,
              (SELECT m.created_at FROM messages m 
               WHERE m.room_id = cr.id 
               ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m 
               WHERE m.room_id = cr.id AND m.sender_id != $1 AND m.is_read = false) as unread_count
       FROM chat_rooms cr
       JOIN chat_participants cp ON cr.id = cp.room_id
       WHERE cp.user_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [userId]
    );

    const rooms = await Promise.all(result.rows.map(async (room) => {
      let roomName = room.name;
      let otherParticipants = [];

      if (!room.is_group) {
        // For direct messages, get the other participant's name
        const participantResult = await pool.query(
          `SELECT u.id, u.first_name, u.last_name, u.profile_picture
           FROM chat_participants cp
           JOIN users u ON cp.user_id = u.id
           WHERE cp.room_id = $1 AND cp.user_id != $2`,
          [room.id, userId]
        );

        if (participantResult.rows.length > 0) {
          const participant = participantResult.rows[0];
          roomName = `${participant.first_name} ${participant.last_name}`;
          otherParticipants = [{
            id: participant.id,
            name: roomName,
            profilePicture: participant.profile_picture
          }];
        }
      }

      return {
        id: room.id,
        name: roomName,
        isGroup: room.is_group,
        lastMessage: room.last_message,
        lastMessageTime: room.last_message_time,
        unreadCount: parseInt(room.unread_count),
        participants: otherParticipants,
        createdAt: room.created_at
      };
    }));

    res.json({ rooms });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or get direct message room
router.post('/rooms/direct', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { otherUserId } = req.body;
    const userId = req.user.userId;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    await client.query('BEGIN');

    // Check if room already exists
    const existingRoom = await client.query(
      `SELECT cr.id FROM chat_rooms cr
       JOIN chat_participants cp1 ON cr.id = cp1.room_id
       JOIN chat_participants cp2 ON cr.id = cp2.room_id
       WHERE cr.is_group = false 
       AND cp1.user_id = $1 AND cp2.user_id = $2`,
      [userId, otherUserId]
    );

    let roomId;

    if (existingRoom.rows.length > 0) {
      roomId = existingRoom.rows[0].id;
    } else {
      // Create new room
      const roomResult = await client.query(
        'INSERT INTO chat_rooms (is_group, created_by) VALUES (false, $1) RETURNING id',
        [userId]
      );

      roomId = roomResult.rows[0].id;

      // Add participants
      await client.query(
        'INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2), ($1, $3)',
        [roomId, userId, otherUserId]
      );
    }

    await client.query('COMMIT');

    // Get room details
    const roomDetails = await pool.query(
      `SELECT u.first_name, u.last_name, u.profile_picture
       FROM chat_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.room_id = $1 AND cp.user_id = $2`,
      [roomId, otherUserId]
    );

    const otherUser = roomDetails.rows[0];

    res.json({
      room: {
        id: roomId,
        name: `${otherUser.first_name} ${otherUser.last_name}`,
        isGroup: false,
        participants: [{
          id: otherUserId,
          name: `${otherUser.first_name} ${otherUser.last_name}`,
          profilePicture: otherUser.profile_picture
        }]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create direct message room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get messages for a room
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is participant in the room
    const participantCheck = await pool.query(
      'SELECT id FROM chat_participants WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    const result = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.profile_picture
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    const messages = result.rows.reverse().map(message => ({
      id: message.id,
      text: message.message_text,
      type: message.message_type,
      sender: {
        id: message.sender_id,
        name: `${message.first_name} ${message.last_name}`,
        profilePicture: message.profile_picture
      },
      isOwn: message.sender_id === userId,
      isRead: message.is_read,
      createdAt: message.created_at
    }));

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE room_id = $1 AND sender_id != $2',
      [roomId, userId]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, type = 'text' } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Verify user is participant in the room
    const participantCheck = await pool.query(
      'SELECT id FROM chat_participants WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Insert message
    const result = await pool.query(
      `INSERT INTO messages (room_id, sender_id, message_text, message_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [roomId, userId, text, type]
    );

    const message = result.rows[0];

    // Get sender details
    const senderResult = await pool.query(
      'SELECT first_name, last_name, profile_picture FROM users WHERE id = $1',
      [userId]
    );

    const sender = senderResult.rows[0];

    const messageData = {
      id: message.id,
      text: message.message_text,
      type: message.message_type,
      sender: {
        id: userId,
        name: `${sender.first_name} ${sender.last_name}`,
        profilePicture: sender.profile_picture
      },
      roomId: roomId,
      createdAt: message.created_at
    };

    // Emit to room via Socket.IO
    const io = req.app.get('io');
    io.to(roomId).emit('new_message', messageData);

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageData
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;