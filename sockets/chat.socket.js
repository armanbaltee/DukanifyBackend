const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const onlineUsers = new Map(); // userId -> Set(socketIds)

// Cloudinary Multer storage
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dukanify/chat',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});
const uploadChatImage = multer({ storage: chatStorage });

function addSocket(userId, socketId) {
  const set = onlineUsers.get(userId) || new Set();
  set.add(socketId);
  onlineUsers.set(userId, set);
}

function removeSocket(userId, socketId) {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(userId);
  else onlineUsers.set(userId, set);
}

module.exports = (chatIO) => {
  chatIO.on('connection', (socket) => {
    const userId = socket.handshake.query?.userId; 

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.user = { id: userId };

    addSocket(userId, socket.id);

    socket.join(`user_${userId}`);
    
    socket.broadcast.emit('userOnline', { userId });

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(`room_${roomId}`);
    });

    // Send message with optional image
    socket.on('sendMessage', async (payload, ack) => {
      try {
        const { roomId, content = '', type = 'text' } = payload;
        let images = [];
        let imagePublicIds = [];

        // If the client sends an image via base64 or file buffer
        if (payload.imageBase64) {
          const uploadRes = await cloudinary.uploader.upload(payload.imageBase64, {
            folder: 'dukanify/chat',
            transformation: [{ width: 800, height: 800, crop: 'limit' }]
          });
          images.push(uploadRes.secure_url);
          imagePublicIds.push(uploadRes.public_id);
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) return ack?.({ error: 'room not found' });

        const created = await Message.create({
          roomId,
          senderId: userId,
          content,
          type: images.length && content
            ? 'image_with_text'
            : images.length
            ? 'image'
            : 'text',
          images,
          imagePublicIds,
          status: 'sent'
        });

        const inc = {};
        if (String(room.storeId) === String(userId)) {
          inc.unreadCountForBuyer = 1;
        } else {
          inc.unreadCountForStore = 1;
        }

        await ChatRoom.findByIdAndUpdate(roomId, {
          $set: {
            lastMessage: content || (images.length ? '[image]' : ''),
            lastMessageType: created.type,
            lastMessageAt: new Date()
          },
          $inc: inc
        });

        chatIO.to(`room_${roomId}`).emit('receiveMessage', created);
        ack?.({ success: true, message: created });
      } catch (err) {
        console.error('sendMessage error', err);
        ack?.({ error: 'server error' });
      }
    });

    socket.on('disconnect', () => {
      removeSocket(userId, socket.id);
      if (!onlineUsers.has(userId)) {
        socket.broadcast.emit('userOffline', { userId });
      }
    });
  });
};
