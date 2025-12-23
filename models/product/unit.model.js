const mongoose = require('mongoose');

// Schema for Product Units (e.g. Kg, Ltr, Pcs)
const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure unit names are unique
    trim: true
  }
});

module.exports = mongoose.model('Unit', unitSchema);
