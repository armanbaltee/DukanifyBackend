const Store = require("../../models/store.model");
const Product = require("../../models/product/product.model");

const getTopStore = async (req, res) => {
  try {
    const products = await Product.find().populate("storeId");

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    const storeMap = new Map();

    products.forEach((product) => {
      const store = product.storeId;

      if (!store || !store._id) return;

      const storeId = store._id.toString();
      const addressWords = store.storeAddress?.split(',').map(w => w.trim()).filter(Boolean) || [];
      const countryOrCity = addressWords[addressWords.length - 1] || "Unknown";

      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, {
          storeId: storeId,
          storeLogo: store.storeLogo,
          storeName: store.storeName,
          category: "Bath Oils, health & beauty, perfume bottles",
          description: store.storeDescription,
          tags: [
            countryOrCity,
            "Manufacturer",
            `1+ Product`,
            `Joined since ${new Date(store.createdAt).getFullYear()}`
          ],
          products: []
        });
      }

      storeMap.get(storeId).products.push({
        id : product._id,
        productImage: product.image,
        productTitle: product.name,
        productPrice: product.price
      });
    });

    for (const store of storeMap.values()) {
      const count = store.products.length;
      store.tags[2] = `${count}+ Product${count > 1 ? 's' : ''}`;
    }

    res.status(200).json({
      message: "Success",
      data: Array.from(storeMap.values()).slice(0, 3)
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getTopStore
};
