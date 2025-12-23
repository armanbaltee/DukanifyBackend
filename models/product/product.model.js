const mongoose = require("mongoose");

// Schema for Products in the store
const productSchema = mongoose.Schema(
  {
    // Product Name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Category Reference
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Brand Name (Optional)
    brand: {
      type: String,
    },
    // Stock Keeping Unit (Unique Identifier)
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    // Selling Price
    price: {
      type: Number,
      required: true,
    },
    // Unit of Measurement (e.g., kg, pcs)
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Unit'
    },
    // Current Stock Level
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    // Product Image URL
    image: {
      type: String,
    },
    // Product Description
    description: {
      type: String,
    },
    // Featured Product Flag
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Active Status (for soft deletion/hiding)
    isActive: {
      type: Boolean,
      default: true,
    },
    // Store that owns this product
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);
