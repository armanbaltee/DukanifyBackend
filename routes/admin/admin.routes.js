const express = require("express");
const router = express.Router();
const adminMiddleware = require("../../middleware/admin/admin.middleware");
const adminController = require("../../controller/admin/admin.controller");

router.post("/login",adminMiddleware.adminMiddleware, adminController.login)
router.get('/getallstore', adminController.getAllStore);
router.put('/acceptrequest/:storeId', adminController.acceptRequest);
router.put('/rejectrequest/:storeId', adminController.rejectRequest);

module.exports = router