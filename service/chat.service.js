// backend/services/chat.service.js
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

async function createRoomIfNotExists(buyerId, storeId) {
  let room = await ChatRoom.findOne({ buyerId, storeId });
  if (!room) room = await ChatRoom.create({ buyerId, storeId });
  return room;
}

/**
 * sendMessage: persist message, update chatroom metadata, increment unread for store
 * io optional - if provided, message will be emitted
 */
async function sendMessage({ roomId, senderId, receiverIsStore = true, content = '', type = 'text', images = [], imagePublicIds = [], io = null }) {
  const message = await Message.create({
    roomId,
    senderId,
    content,
    type,
    images,
    imagePublicIds,
    status: 'sent'
  });

  // Update ChatRoom: last message and unread counts
  const update = {
    lastMessage: content || (type === 'image' ? '[image]' : '[image_with_text]'),
    lastMessageType: type,
    lastMessageAt: new Date()
  };
  const inc = {};
  if (receiverIsStore) inc.unreadCountForStore = 1;
  else inc.unreadCountForBuyer = 1;

  await ChatRoom.findByIdAndUpdate(roomId, { $set: update, $inc: inc }, { new: true });

  // Emit to room and to buyer/store personal rooms (if io provided)
  if (io) {
    // emit to room channel (if clients joined room_{roomId})
    io.to(`room_${roomId}`).emit('receiveMessage', message);
    // emit to store personal room if you can deduce store user id mapping on server,
    // for this implementation we emit to room only. You can also emit to `user_{userId}` if available.
  }

  return message;
}

module.exports = { createRoomIfNotExists, sendMessage };
