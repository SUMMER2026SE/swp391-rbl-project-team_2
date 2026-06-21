const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`👤 Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Join a user-specific notification channel
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 Socket ${socket.id} joined user channel: user_${userId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`👤 Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Handle sending a message
    socket.on('send_message', (data) => {
      const { conversationId, message } = data;
      // Broadcast the message to everyone in the room except the sender
      socket.to(conversationId).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
