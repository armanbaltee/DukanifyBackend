const express = require('express');
const router = express.Router();
const storeOrdersController = require('../../controller/store-orders/storeOrders.controller')

router.get('/getAllBuyerOrders/:id', storeOrdersController.getAllOrdersByStore)

router.put('/changeOrderStatus', storeOrdersController.changeOrderStatus)


module.exports = router