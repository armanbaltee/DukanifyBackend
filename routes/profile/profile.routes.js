const express = require("express");
const router = express.Router();
const userController = require("../../controller/myprofile/profile.controller");


const upload = require('../../middleware/cloudinaryUploader/cloudinaryUploader');


router.get('/:id', userController.getUserById);

router.put('/:id', upload.single('photo'), userController.updateUserById);

module.exports = router;