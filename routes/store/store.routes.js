
const express = require('express');
const router = express.Router();
const { searchStores } = require('/controller/store/store-controller');

// Route for store search
router.get('/search', searchStores);

module.exports = router;
