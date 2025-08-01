const BuyerOrder = require('../../models/order/buyer order/buyer.order')


exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    const orders = await BuyerOrder.find({ userID: userId, isOrderConfirmed: false })
      .sort({ createdAt: -1 })
      .populate('userID', 'name')
      .populate('orderDetails.storeID', 'storeName')
      .populate('orderDetails.products.productID'); 

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No Orders Found!' });
    }

    const formattedOrders = [];

    orders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.products.forEach(product => {
          const prod = product.productID;
          formattedOrders.push({
            orderId: order._id,
            userId: order.userID?._id,
            storeId: detail.storeID?._id,
            storeName: detail.storeID?.storeName,
            productId: prod?._id,
            productName: prod?.name,
            productImage: prod?.image,
            productPrice: prod?.price,
            quantity: product.quantity,
            totalPrice: product.totalPrice,
          });
        });
      });
    });

    return res.status(200).json(formattedOrders);

  } catch (error) {
    console.error('Error in finding orders', error);
    res.status(500).json({ message: 'Error in finding orders', error: error.message });
  }
};



exports.deleteOneOrder = async (req, res) => {
  const { userId, orderId, productId, storeId } = req.body;

  try {
    const order = await BuyerOrder.findOne({ _id: orderId, userID: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let orderModified = false;

    order.orderDetails = order.orderDetails.map(store => {
      if (store.storeID.toString() === storeId) {
        const originalLength = store.products.length;

        // Remove the product from the store's product list
        store.products = store.products.filter(
          product => product.productID.toString() !== productId
        );

        if (store.products.length < originalLength) {
          orderModified = true;
        }
      }
      return store;
    }).filter(store => store.products.length > 0); // Remove the store if no products left

    if (!orderModified) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    if (order.orderDetails.length === 0) {
      // If no store or products left in the order, delete entire order
      await BuyerOrder.findByIdAndDelete(orderId);
      return res.status(200).json({ message: 'Product removed and order deleted as no items remained' });
    } else {
      const updatedOrder = await order.save();
      return res.status(200).json({ message: 'Product removed from order', data: updatedOrder });
    }

  } catch (error) {
    console.error('Error in deleting product from order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




exports.deleteAllOrders = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await BuyerOrder.deleteMany({ userID: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json({
      message: 'All orders deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.updateOrder = async (req, res) => {
  const { userId, orderId, productId, storeId, newQuantity, newTotalPrice } = req.body;

  try {
    const order = await BuyerOrder.findOne({ _id: orderId, userID: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let productUpdated = false;

    // Loop through orderDetails to find the correct store
    order.orderDetails.forEach(store => {
      if (store.storeID.toString() === storeId) {
        store.products.forEach(product => {
          if (product.productID.toString() === productId) {
            product.quantity = newQuantity;
            product.totalPrice = newTotalPrice;
            productUpdated = true;
          }
        });
      }
    });

    if (!productUpdated) {
      return res.status(404).json({ message: 'Product not found in this order' });
    }

    const updatedOrder = await order.save();
    res.status(200).json({ message: 'Order updated successfully', data: updatedOrder });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




exports.confirmCheckout = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    
    const unconfirmedOrders = await BuyerOrder.find({ userID: userId, isOrderConfirmed: false });

    if (unconfirmedOrders.length === 0) {
      return res.status(404).json({ message: "No unconfirmed orders found for this user" });
    }

    
    const result = await BuyerOrder.updateMany(
      { userID: userId, isOrderConfirmed: false },
      { $set: { isOrderConfirmed: true } }
    );

    res.status(200).json({
      message: "Checkout confirmed. Orders updated.",
      updatedCount: result.modifiedCount || result.nModified
    });

  } catch (error) {
    console.error("Error confirming checkout:", error);
    res.status(500).json({ message: "Server error while confirming checkout", error: error.message });
  }
};

