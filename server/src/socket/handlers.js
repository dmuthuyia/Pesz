const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');

const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join chat rooms
    socket.on('join_chat_rooms', async () => {
      try {
        const result = await pool.query(
          `SELECT DISTINCT cr.id
           FROM chat_rooms cr
           JOIN chat_participants cp ON cr.id = cp.room_id
           WHERE cp.user_id = $1`,
          [socket.userId]
        );

        result.rows.forEach(room => {
          socket.join(room.id);
        });
      } catch (error) {
        console.error('Error joining chat rooms:', error);
      }
    });

    // Handle joining specific chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // Handle leaving chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // Handle typing indicators
    socket.on('typing_start', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = { setupSocketHandlers };