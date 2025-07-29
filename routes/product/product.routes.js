const express = require("express");
const router = express.Router();
const productController = require("../../controller/product/product.controller");
const upload = require("../../middleware/product/product.upload");

router.post('/add', upload.single('image'), productController.addProduct);
router.get('/get', productController.getAllProducts);
router.put('/update/:id', upload.single('image'), productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct)

module.exports = router;