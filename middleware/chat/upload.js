const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../utils/cloudinary');

const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dukanify/chat', // folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const uploadChatImage = multer({ storage: chatStorage });

module.exports = { uploadChatImage };
