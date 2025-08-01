const express = require('express');
const router = express.Router();
const searchbar = require('../../controller/searchbar/serchbar');

router.get('/search-all', searchbar.searchAll);

module.exports = router;
