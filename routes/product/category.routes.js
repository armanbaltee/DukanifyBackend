const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/product/category.controller");

router.post("/addsingle", categoryController.singleCategoryAdd);
router.post("/addmultiple", categoryController.multipleCategory);
router.get('/get', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategory)

module.exports = router