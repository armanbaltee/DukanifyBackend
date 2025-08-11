const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  lastMessage: { type: String, default: '' },
  lastMessageType: { type: String, enum: ['text','image','image_with_text'], default: 'text' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCountForStore: { type: Number, default: 0 },
  unreadCountForBuyer: { type: Number, default: 0 }
}, { timestamps: true });

chatRoomSchema.index({ buyerId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
