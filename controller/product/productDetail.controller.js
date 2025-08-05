const Product = require("../../models/product/product.model");
const BuyerOrder = require("../../models/order/buyer order/buyer.order");
const getProductDetailById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(500).json({ message: "No product Found" });
    }
    const productDetails = {
      id: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      category: product.category.name,
      description: product.description,
      image: product.image,
      storeId: product.storeId,
    };
    res.status(200).json({ message: "Product Details", data: productDetails });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", err: error.message });
  }
};

const productAddtoCart = async (req, res) => {
  try {
    const { userID, storeID, productID, quantity, totalPrice } = req.body;
    if (!userID || !storeID || !productID || !quantity || !totalPrice) {
      return res.status(500).json({ message: "Every field required" });
    }

    const buyerOrder = new BuyerOrder({
      userID,
      orderDetails: [
        {
          storeID,
          products: [
            {
              productID,
              quantity,
              totalPrice,
            },
          ],
        },
      ],
    });
    
    await buyerOrder.save();
    res.status(200).json({ message: "Order add successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", err: error.message });
  }
};

const getFeatureProduct = async (req, res)=>{
    try {
        const id = req.params.id;
        const relatedProduct = await Product.find({storeId: id})
        if(!relatedProduct){
            return res
            .status(500)
            .json({ message: "No Product Found"});
        }
        res.status(200).json({message: "related product:", data: relatedProduct})
    } catch (error) {
        return res
      .status(500)
      .json({ message: "Server Error", err: error.message });
    }
}

module.exports = {
  getProductDetailById,
  productAddtoCart,
  getFeatureProduct
};
