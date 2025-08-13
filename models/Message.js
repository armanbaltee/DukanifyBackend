const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text','image','image_with_text'], default: 'text' },
  images: [{ type: String }],
  imagePublicIds: [{ type: String }],
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' },
  readAt: { type: Date }
}, { timestamps: true });

messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
