const mongoose = require('mongoose');

// Schema for tracking inventory changes (audit log)
const inventoryLogSchema = new mongoose.Schema({
  // Product being changed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Quantity change (positive for add, negative for subtract)
  change: {
    type: Number,
    required: true
  },
  // Reason for the inventory change
  reason: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'wastage', 'adjustment'],
    required: true
  },
  // Time of change
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
