const mongoose = require('mongoose');

// Schema for a Chat Room between a Buyer and a Store
const chatRoomSchema = new mongoose.Schema({
  // Participants
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },

  // Last Message Info (for displaying in the chat list)
  lastMessage: { type: String, default: '' },
  lastMessageType: { type: String, enum: ['text', 'image', 'image_with_text'], default: 'text' },
  lastMessageAt: { type: Date, default: Date.now },

  // Unread Counts
  unreadCountForStore: { type: Number, default: 0 },
  unreadCountForBuyer: { type: Number, default: 0 }
}, { timestamps: true }); // Automatically manage createdAt and updatedAt

// Ensure unique chat room per buyer-store pair
chatRoomSchema.index({ buyerId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

