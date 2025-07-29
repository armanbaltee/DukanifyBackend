const express = require("express");
const router = express.Router();
const userController = require("../../controller/myprofile/profile.controller");
const multer = require('multer');
const path = require('path');
// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.get('/:id', userController.getUserById);
router.put('/:id', upload.single('photo'), userController.updateUserById);

module.exports =router