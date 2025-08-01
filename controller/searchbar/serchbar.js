const Store = require('../../models/store.model');
const Product = require('../../models/product/product.model');

// @desc    Search verified stores and active products
// @route   GET /api/search/search-all?query=milk
// @access  Public
exports.searchAll = async (req, res) => {
  try {
    const query = req.query.query;

    const stores = await Store.find({
      isStoreVerified: true,
      storeName: { $regex: query, $options: 'i' }
    }).limit(5);

    const products = await Product.find({
      stock: { $gt: 10 },
      isActive: true,
      name: { $regex: query, $options: 'i' }
    }).limit(5);

    res.status(200).json({ stores, products });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
