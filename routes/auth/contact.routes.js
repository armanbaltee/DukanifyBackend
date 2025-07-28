const express = require("express");
const router = express.Router();
const { validateContact } = require("../../controller/auth/contact.controller");
const validateMiddleware = require("../../middleware/contact.middleware");

router.post("/contactUs", validateContact);

module.exports = router;
