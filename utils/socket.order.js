// socket.js
let io;
const userSocketMap = {};  // { userId: socketId }
const storeSocketMap = {}; // { storeId: socketId }

const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Register a user (buyer or seller) with their ID
    socket.on('registerUser', (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`🛒 User ${userId} registered with socket ${socket.id}`);
      }
    });

    // Register a store with storeId
    socket.on('registerStore', (storeId) => {
      if (storeId) {
        storeSocketMap[storeId] = socket.id;
        console.log(`🏪 Store ${storeId} registered with socket ${socket.id}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);

      // Remove from userSocketMap
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          console.log(`🛒 User ${userId} removed from socket map`);
          break;
        }
      }

      // Remove from storeSocketMap
      for (const storeId in storeSocketMap) {
        if (storeSocketMap[storeId] === socket.id) {
          delete storeSocketMap[storeId];
          console.log(`🏪 Store ${storeId} removed from socket map`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const getSocketId = (id, type = 'user') => {
  return type === 'store' ? storeSocketMap[id] : userSocketMap[id];
};

// Emit to a specific store
const emitToStore = (storeId, event, data) => {
  const socketId = getSocketId(storeId, 'store');
  if (io && socketId) {
    io.to(socketId).emit(event, data);
  } else {
    console.warn(`⚠️ Store ${storeId} not connected`);
  }
};

// Emit to a specific user (buyer)
const emitToUser = (userId, event, data) => {
  const socketId = getSocketId(userId, 'user');
  if (io && socketId) {
    io.to(socketId).emit(event, data);
  } else {
    console.warn(`⚠️ User ${userId} not connected`);
  }
};

module.exports = {
  init,
  getIO,
  emitToStore,
  emitToUser,
  getSocketId
};
