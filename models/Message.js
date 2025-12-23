const mongoose = require('mongoose');

// Schema for individual messages within a Chat Room
const messageSchema = new mongoose.Schema({
  // Reference to the Chat Room
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },

  // Sender of the message (User ID)
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Message Content
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'image_with_text'], default: 'text' },

  // Media attachments
  images: [{ type: String }], // URLs of images
  imagePublicIds: [{ type: String }], // Cloudinary Public IDs

  // Message Status
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readAt: { type: Date }
}, { timestamps: true }); // Automatically manage createdAt (sent time)

// Index for efficiently fetching messages for a room, sorted by time
messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
