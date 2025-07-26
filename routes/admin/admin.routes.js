const express = require("express");
const router = express.Router();
const adminMiddleware = require("../../middleware/admin/admin.middleware");
const adminController = require("../../controller/admin/admin.controller");

router.post("/login",adminMiddleware.adminMiddleware, adminController.login)
router.get('/getpending', adminController.getPendingList);

module.exports = router