const Store = require("../../models/store.model");
const Product = require("../../models/product/product.model");

const getTopStore = async (req, res) => {
  const userId = req.params.id;

  try {

    const products = await Product.find()
      .populate({
        path: "storeId",
        match: { userId: { $ne: userId } }
      });

    const storeMap = new Map();

    for (const product of products) {
      const store = product.storeId;

      if (!store || !store._id) continue;

      const storeId = store._id.toString();

      if (!storeMap.has(storeId)) {
        const addressParts = store.storeAddress?.split(",").map(p => p.trim());
        const countryOrCity = addressParts?.[addressParts.length - 1] || "Unknown";

        storeMap.set(storeId, {
          storeId: storeId,
          storeLogo: store.storeLogo,
          storeName: store.storeName,
          category: "Bath Oils, health & beauty, perfume bottles",
          description: store.storeDescription,
          tags: [
            countryOrCity,
            "Manufacturer",
            "1+ Product",
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
    }

    for (const store of storeMap.values()) {
      const count = store.products.length;
      store.tags[2] = `${count}+ Product${count > 1 ? "s" : ""}`;
    }

    const topStores = Array.from(storeMap.values()).slice(0, 3);

    if (topStores.length === 0) {
      return res.status(404).json({ message: "No stores found" });
    }

    res.status(200).json({
      message: "Success",
      data: topStores
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
