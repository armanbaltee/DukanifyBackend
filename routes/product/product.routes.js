const express = require("express");
const router = express.Router();
const productController = require("../../controller/product/product.controller");
const upload = require("../../middleware/product/product.upload");
const productScript = require('../../controller/product/productScript')
const searchbar = require('../../controller/searchbar/serchbar')
const productDetailController = require('../../controller/product/productDetail.controller')
router.post('/add', upload.single('image'), productController.addProduct);
router.get('/get', productController.getAllProducts);
router.put('/update/:id', upload.single('image'), productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct)
router.get('/getById/:id', productController.getProductById)

router.get('/landing-products', productController.getLandingProducts);
router.get('/getproductdeatail/:id', productDetailController.getProductDetailById)
router.post('/addtocart', productDetailController.productAddtoCart)
router.put('bulkUpdate', productScript.bulkUpateProduct)
router.get('/getfeaturedproduct/:id', productDetailController.getFeatureProduct)

module.exports = router;