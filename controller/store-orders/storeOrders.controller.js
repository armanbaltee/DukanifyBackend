const BuyerOrder = require('../../models/order/buyer order/buyer.order')
const socketUtil = require('../../utils/socket.order');

exports.getAllOrdersByStore = async (req, res) => {
  const storeId = req.params.id;

  try {
    const orders = await BuyerOrder.find({ 'orderDetails.storeID': storeId })
      .populate('userID', 'name')
      .populate('orderDetails.products.productID', 'name image');

    const formatted = {
      pending: [],
      inProgress: [],
      ready: [],
      fulfilled: []
    };

    for (const order of orders) {
      const buyerName = order.userID?.name;
      const buyerPhone = order.buyerPhone;
      const buyerNotes = order.buyerNotes;
      const orderedAt = order.createdAt;

      for (const detail of order.orderDetails) {
        if (detail.storeID.toString() !== storeId) continue; // Filter only current store

        for (const p of detail.products) {
          const product = p.productID;

          const orderObj = {
            id: order._id,
            orderId: order._id.toString().slice(17),
            buyerName,
            buyerPhone,
            buyerNotes,
            orderedAt,
            products: [{
              name: product?.name,
              quantity: p?.quantity,
              price: p?.totalPrice,
              image: product?.image
            }]
          };

          switch (order.orderStatus) {
            case 'Pending':
              formatted.pending.push(orderObj);
              break;
            case 'Accept':
              formatted.inProgress.push(orderObj);
              break;
            case 'Packed':
              formatted.ready.push(orderObj);
              break;
            case 'Fullfilled':
              formatted.fulfilled.push(orderObj);
              break;
            default:
              formatted.pending.push(orderObj);
          }
        }
      }
    }

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};



exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const statusMap = {
      Accept: 'inProgress',
      Reject: 'declined',
      Packed: 'ready',
      Fullfilled: 'fulfilled'
    };
    // const finalStatus = statusMap[status] || status;

    const order = await BuyerOrder.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    ).populate('userID', '_id name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify store & buyer
    socketUtil.emitToUser(order.userID._id.toString(), 'orderStatusUpdated', {
      orderId: order._id,
      status: status,
      buyerName: order.userID.name,
      updatedAt: new Date()
    });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
