const express = require('express');
const router = express.Router();
const chatController = require('../../controller/chat/chat.contoller');
const { uploadChatImage } = require('../../middleware/chat/upload');



router.get('/rooms/:id', chatController.getRooms);
router.get('/:roomId/messages', chatController.getMessages);
router.post('/:roomId/message', uploadChatImage.single('image'), chatController.sendMessage);

module.exports = router;
