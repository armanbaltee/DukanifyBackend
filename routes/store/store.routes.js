const express = require("express");
const router = express.Router();
const storeController = require("../../controller/store/store-controller");
const upload = require("../../middleware/uploads");

// Route for store search
router.get("/search", storeController.searchEcommerce);
router.get("/verified-sellers", storeController.getVerifiedSellers);

router.post(
  "/registerStore",
  upload.fields([
    { name: "storeLogo", maxCount: 1 },
    { name: "storeBanner", maxCount: 5 },
    { name: "storePictures", maxCount: 10 },
  ]),
  storeController.createStore
);

router.get("/getStore/:id", storeController.getStore);

router.get("/getStoreById/:id", storeController.getStoreById);

router.get("/getAllStoreNames", storeController.getAllStoreNames);

router.get("/getStoreWithProducts/:id", storeController.getStoreWithProducts);

router.get('/checkaccess/:id', storeController.accessSellerDashboard)

module.exports = router;