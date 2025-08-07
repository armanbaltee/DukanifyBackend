const express = require("express");
const router = express.Router();
const userController = require("../../controller/myprofile/profile.controller");
const loginController = require("../../controller/auth/login-auth/forgotAndResetPass");

const upload = require('../../middleware/cloudinaryUploader/cloudinaryUploader');

router.put('/change-password', loginController.changePassword);
router.get('/:id', userController.getUserById);

router.put('/:id', upload.single('photo'), userController.updateUserById);


module.exports = router;