const ChatRoom = require('../../models/ChatRoom');
const Message = require('../../models/Message');

exports.getRooms = async (req, res) => {
  try {
    const { id: userId } = req.params

    const {storeId} = req.query

    let rooms = [];

    if (storeId) {
      rooms = await ChatRoom.find({ storeId : storeId })
        .populate('buyerId', 'name', 'User')
        .sort({ lastMessageAt: -1 });
    }else{
        rooms = await ChatRoom.find({ buyerId : userId }).populate('storeId', 'storeName', 'Store').sort({ lastMessageAt: -1 })
    }

    
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load chat rooms' });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ error: 'senderId is required' });
    }

    let imageUrl = null;
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary secure URL
    }

    const message = await Message.create({
      roomId,
      senderId, // now always available
      content: text,
      type: imageUrl && text ? 'image_with_text' : imageUrl ? 'image' : 'text',
      images: imageUrl ? [imageUrl] : [],
      status: 'sent'
    });

    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: text || '[image]',
      lastMessageType: imageUrl && text ? 'image_with_text' : imageUrl ? 'image' : 'text',
      lastMessageAt: new Date()
    });

    

    req.chatIO.to(`room_${roomId}`).emit('receiveMessage', message);


    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
