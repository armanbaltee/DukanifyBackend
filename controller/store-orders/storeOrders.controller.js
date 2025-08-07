const BuyerOrder = require('../../models/order/buyer order/buyer.order')

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
    const { orderId, status } = req.body

    console.log('chnage stsua========', req.body)

    try{
        const exist = await BuyerOrder.find({ _id : orderId })

        if(exist.length === 0) return res.status(400).send({ message : 'No order found' })

        const updatedorderstatus = await BuyerOrder.updateMany(
            { _id : orderId, isOrderConfirmed: true },
            { $set: { orderStatus: status } }
        )

        console.log('updated status=====', updatedorderstatus)

        res.status(200).send({ message : 'Status Updated Successfully' })
        
    }
    catch(error){
        console.log('Error in updating order status', error)
        res.status(400).send({ message : 'Error in updating order status' })
    }
}