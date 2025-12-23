const mongoose = require('mongoose');

// Define the schema for the Store model
const storeSchema = new mongoose.Schema({
  // Reference to the User who owns the store
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Basic Store Information
  storeName: { type: String, required: true },
  storeAddress: { type: String, required: true },

  // Geospatial data for store location (requires 2dsphere index for proximity search)
  location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type must be 'Point'
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    }
  },

  // Store Visuals
  storeLogo: { type: String }, // URL to the store logo
  storeBanner: [{ type: String }], // Array of URLs for banner images
  storePictures: [{ type: String }], // Array of URLs for other store images
  storeCertifications: [{ type: String }], // Array of URLs for certification images

  // Contact Information
  storePhone: { type: String, required: true },

  // Operating Hours
  storeTiming: {
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true }
  },

  // Store Details
  storeDescription: { type: String, required: true },

  // Accepted Payment Methods
  storePaymentMethods: [{
    type: String,
    enum: ['Cash', 'Jazzcash', 'Easypaisa', 'Card'], // Allowed values
    required: true
  }],

  // Product Categories offered by the store
  category: [{
    type: String,
    enum: ['Electronics', 'Fashion', 'Groceries', 'Home Appliances', 'Health & Beauty'], // Predefined categories
  }],

  // Verification Status
  isStoreVerified: { type: Boolean, default: false },

  // Timestamp
  createdAt: { type: Date, default: Date.now }
});

// Export the Store model
module.exports = mongoose.model('Store', storeSchema);
