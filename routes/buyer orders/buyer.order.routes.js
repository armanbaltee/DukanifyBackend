const express = require("express");
const router = express.Router();

const buyerOrderControler = require("../../controller/buyer order/buyerOrder.controller")

router.get('/getorder/:userId', buyerOrderControler.getAllOrders);
router.put('/status/:orderId', buyerOrderControler.updateOrderStatus)
router.put('/cancel-order', buyerOrderControler.cancelOrder);

module.exports = router