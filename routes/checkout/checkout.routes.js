const express = require("express");
const router = express.Router();
const checkoutController = require('../../controller/checkout/checkout.controller')

router.get('/getAllOrders/:id', checkoutController.getAllOrders)

router.delete('/deleteOrder', checkoutController.deleteOneOrder)

router.delete('/deleteAllOrders/:id', checkoutController.deleteAllOrders)

router.put('/updateOrder', checkoutController.updateOrder)

router.put('/confirmCheckout/:id', checkoutController.confirmCheckout)




module.exports = router