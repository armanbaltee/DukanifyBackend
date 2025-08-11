const BuyerOrder = require('../../models/order/buyer order/buyer.order')
const Product = require('../../models/product/product.model')


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





const ChatRoom = require('../../models/ChatRoom');
const Message = require('../../models/Message');
const { createRoomIfNotExists, sendMessage } = require('../../service/chat.service');
const cloudinary = require('../../utils/cloudinary');

/**
 * Confirm checkout: mark orders confirmed, reduce stock, then create chats per store and send initial messages.
 * Assumption: this endpoint is protected; req.user.id is buyer's id (JWT)
 */
exports.confirmCheckout = async (req, res) => {
  const userId = req.params.id; // or use req.user.id if using auth middleware
  const { phone, notes } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // 1) Fetch all unconfirmed orders for this buyer
    const unconfirmedOrders = await BuyerOrder.find({
      userID: userId,
      isOrderConfirmed: false
    })
    .populate('orderDetails.storeID')
    .populate('orderDetails.products.productID');

    if (!unconfirmedOrders.length) {
      return res.status(404).json({ message: "No unconfirmed orders found for this user" });
    }

    // 2) Reduce stock for each product
    for (const order of unconfirmedOrders) {
      for (const detail of order.orderDetails) {
        for (const p of detail.products) {
          await Product.findByIdAndUpdate(p.productID, { $inc: { stock: -p.quantity } }, { new: true });
        }
      }
    }

    // 3) Mark these orders confirmed (single update)
    await BuyerOrder.updateMany(
      { userID: userId, isOrderConfirmed: false },
      { $set: { isOrderConfirmed: true, buyerPhone: phone, buyerNotes: notes } }
    );

    // 4) Group products by store across all these orders
    const storeMap = {}; // storeId -> { store: storeDoc, products: [{ name, qty, totalPrice, image }] }
    unconfirmedOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        const storeId = String(detail.storeID._id);
        if (!storeMap[storeId]) storeMap[storeId] = { store: detail.storeID, products: [] };

        detail.products.forEach(prod => {
          const productDoc = prod.productID;
          storeMap[storeId].products.push({
            productId: productDoc._id,
            name: productDoc.name || productDoc.title || 'Product',
            quantity: prod.quantity,
            totalPrice: prod.totalPrice,
            imageUrl: productDoc.image || productDoc.imageUrl || null // adjust based on your Product schema
          });
        });
      });
    });

    const io = req.app.get('io'); // socket.io instance (set in server.js)
    const chatResults = [];

    // 5) For each store create room (if not exists), upload images to Cloudinary, send single message
    for (const [storeId, data] of Object.entries(storeMap)) {
      const room = await createRoomIfNotExists(userId, storeId);

      // build product summary and total for this store
      const productSummary = data.products.map(p => `${p.name} x ${p.quantity}`).join(', ');
      const totalAmount = data.products.reduce((s, p) => s + (p.totalPrice || 0), 0);

      // message text
      const messageText = `Buyer ${userId} with Orders has ordered: ${productSummary} | Total: ${totalAmount}`;

      // upload available product images to Cloudinary (upload remote URLs or skip)
      const images = [];
      const imagePublicIds = [];
      for (const p of data.products) {
        if (p.imageUrl) {
          try {
            // Cloudinary can upload remote URLs directly
            const uploadRes = await cloudinary.uploader.upload(p.imageUrl, {
              folder: `dukanify/chats/${storeId}`
            });
            if (uploadRes && uploadRes.secure_url) {
              images.push(uploadRes.secure_url);
              imagePublicIds.push(uploadRes.public_id);
            }
          } catch (err) {
            console.warn('Cloudinary upload failed for', p.imageUrl, err.message);
            // don't fail the whole flow for one image; continue
          }
        }
      }

      // send message via service (it will save to DB and emit if io passed)
      const message = await sendMessage({
        roomId: room._id,
        senderId: userId,
        receiverIsStore: true, // unread++ for store side
        content: messageText,
        type: images.length ? (messageText ? 'image_with_text' : 'image') : 'text',
        images,
        imagePublicIds,
        io
      });

      chatResults.push({ storeId, roomId: room._id, firstMessage: message });
    }

    return res.status(200).json({
      message: "Checkout confirmed. Orders updated, stock reduced, chats initiated.",
      chats: chatResults
    });

  } catch (error) {
    console.error("Error confirming checkout:", error);
    return res.status(500).json({
      message: "Server error while confirming checkout",
      error: error.message
    });
  }
};
