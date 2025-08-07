const socket = require('../../utils/socket.order'); 
const BuyerOrder = require('../../models/order/buyer order/buyer.order');


const getAllOrders = async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await BuyerOrder.find({ userID: userId })
      .populate('orderDetails.storeID')
      .populate('orderDetails.products.productID');
    const flattenedOrders = [];

    orders.forEach(order => {
      order.orderDetails.forEach(orderDetail => {
        orderDetail.products.forEach(product => {
          flattenedOrders.push({
            orderId: order._id,
            productId: product.productID?._id,
            productName: product.productID?.name,
            image: product.productID?.image,
            quantity: product.quantity,
            totalPrice: product.totalPrice,
            storeId: orderDetail.storeID?._id,
            storeName: orderDetail.storeID?.name,
            status: order.orderStatus.toLowerCase(),
            date: order.createdAt
          });
        });
      });
    });

    res.status(200).json(flattenedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus, userId } = req.body;
s
    const allowedStatuses = ["Pending", "Accept", "Reject", "Packed", "Fullfilled"];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await BuyerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = newStatus;
    await order.save();

    const notificationData = {
      orderId: order._id,
      status: order.orderStatus.toLowerCase(),
      updatedAt: order.updatedAt
    };


    socket.emitToUser(userId, 'orderStatusUpdated', notificationData);

    return res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId, userId, storeId } = req.body;

  try {
    const order = await BuyerOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.orderStatus = 'Cancel';
    await order.save();

    const notification = {
      orderId: order._id,
      status: 'cancelled by buyer',
      userId,
      storeId,
      timestamp: new Date()
    };


    socket.emitToStore(storeId, 'orderCancelled', notification);

    return res.status(200).json({ message: 'Order cancelled', notification });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};


module.exports = {
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
