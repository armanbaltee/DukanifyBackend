const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  storeName: { type: String, required: true },
  storeAddress: { type: String, required: true },

  storeLogo: { type: String },
  storeBanner: [{ type: String }],
  storePictures: [{ type: String }],
  storeCertifications: [{ type: String }],

  storePhone: { type: String, required: true },

  storeTiming: {
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true }
  },

  storeDescription: { type: String, required: true },

  storePaymentMethods: [{
    type: String,
    enum: ['cash', 'jazzcash', 'easypaisa', 'card'],
    required: true
  }],

  category: [{
    type: String,
    enum: ['Electronics', 'Fashion', 'Groceries', 'Home Appliances', 'Health & Beauty'],
  }],

  isStoreVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', storeSchema);
