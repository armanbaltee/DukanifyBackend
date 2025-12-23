const mongoose = require('mongoose');

// Schema for Product Categories
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure category names are unique
    trim: true    // Remove whitespace from ends
  }
});

module.exports = mongoose.model('Category', categorySchema);
