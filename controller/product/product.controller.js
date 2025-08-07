const Product = require('../../models/product/product.model');


const generateSKU = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let sku = '';
  for (let i = 0; i < length; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};

const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      unit,
      stock,
      description,
      isFeatured,
      isActive,
      storeId
    } = req.body;

    let sku;
    let skuExists = true;
    while (skuExists) {
      sku = generateSKU(8);
      const existingProduct = await Product.findOne({ sku });
      if (!existingProduct) {
        skuExists = false;
      }
    }

    const image = req.file ? req.file.path : '';

    const product = new Product({
      name,
      category,
      brand,
      sku,
      price,
      unit,
      stock,
      image,
      description,
      isFeatured,
      isActive,
      storeId
    });

    await product.save();
    res.status(201).json({ message: 'Product added with auto-generated SKU', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category').populate('unit');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const updateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      unit,
      stock,
      description,
      isFeatured,
      isActive
    } = req.body;

    const updateData = {
      name,
      category,
      brand,
      price,
      unit,
      stock,
      description,
      isFeatured,
      isActive,
    };

    if (req.file && req.file.path) {
      updateData.image = req.file.path; 
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res)=>{
  try {
    const id= req.params.id
    const product = await Product.findById(id).populate('category').populate('unit');;
    if(!id){
      return res.status(500).json({message: "No product Id"});
    }
    res.status(200).json({message: "Product is: ", product})
  } catch (error) {
    
  }
}
const getLandingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      stock: { $gt: 5 }
    })
    .limit(10)
    .populate('storeId', 'storeName isStoreVerified').populate('unit');

    res.status(200).json(products);
  } catch (error) {
    console.error('Landing products error:', error);
    res.status(500).json({ message: 'Failed to load landing products' });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getLandingProducts
};
