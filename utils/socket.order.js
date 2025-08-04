let io;

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
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const initSocket = (serverIO) => {
  io = serverIO;
};

const emitToStore = (storeId, event, data) => {
  if (io) {
    io.to(storeId).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

module.exports = {
  init,
  getIO,
  initSocket,
  emitToStore,
  emitToUser
};
