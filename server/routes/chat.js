import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for chat attachments (images, PDFs, Word docs, and audio for voice messages)
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const allowedAttachmentTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|webm|mp3|wav|ogg/;
const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const extname = allowedAttachmentTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Unsupported file type'), false);
  }
});

// Get pending connection requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'username avatar');
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch connection requests' });
  }
});

// Send connection request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;
    console.log('Connection request received:', { 
      receiverId, 
      user: req.user,
      body: req.body,
      headers: req.headers 
    });
    
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    console.log('Receiver found:', receiver);
    
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if trying to connect with self
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ],
      status: 'pending'
    }).lean();
    console.log('Existing request:', existingRequest);

    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      members: { $all: [req.user._id, receiverId] }
    }).lean();
    console.log('Existing chat:', existingChat);

    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists' });
    }

    // Create new request
    const request = new ConnectionRequest({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });
    console.log('New request created:', request);
    
    await request.save();
    console.log('Request saved successfully');

    // Populate sender details
    const populatedRequest = await ConnectionRequest.findById(request._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .lean();

    console.log('Populated request:', populatedRequest);
    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error in connection request:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      user: req.user
    });
    res.status(500).json({ 
      message: 'Failed to send connection request',
      error: error.message,
      details: error.name
    });
  }
});

// Respond to connection request
router.post('/request/:requestId/respond', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accept } = req.body;

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'username avatar');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (accept) {
      // Reuse an existing chat between these two members instead of creating a duplicate
      let chat = await Chat.findOne({
        members: { $all: [request.sender._id, request.receiver] }
      });

      if (!chat) {
        chat = new Chat({
          members: [request.sender._id, request.receiver]
        });
        await chat.save();

        // Create welcome message only for a brand-new chat
        const message = new Message({
          chatId: chat._id,
          sender: request.sender._id,
          text: "Hey, Hope you're doing well. May I connect with you?"
        });
        await message.save();

        chat.lastMessage = message._id;
        await chat.save();
      }

      // Mark request as accepted
      request.status = 'accepted';
      await request.save();

      // Return chat with populated data
      const populatedChat = await Chat.findById(chat._id)
        .populate('members', 'username avatar')
        .populate('lastMessage');

      res.json({
        ...populatedChat.toObject(),
        otherUser: request.sender
      });
    } else {
      // Mark request as rejected
      request.status = 'rejected';
      await request.save();
      res.json({ message: 'Request rejected' });
    }
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ message: 'Failed to process connection request response' });
  }
});

// Search users to start a new conversation with
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: q.trim(), $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('username avatar').limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

// Get messages for a chat
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.members.some(id => id.toString() === req.user._id.toString())) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message in a chat (optionally with a file/image/voice-note attachment)
router.post('/:chatId/messages', authenticateToken, attachmentUpload.single('file'), async (req, res) => {
  try {
    const text = req.body.text?.trim() || '';
    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message text or an attachment is required' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.members.some(id => id.toString() === req.user._id.toString())) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = new Message({
      chatId: req.params.chatId,
      sender: req.user._id,
      text,
      attachment: req.file ? {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimetype: req.file.mimetype
      } : undefined,
      readBy: [req.user._id]
    });
    await message.save();

    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatar');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark messages in a chat as read
router.put('/:chatId/read', authenticateToken, async (req, res) => {
  try {
    await Message.updateMany(
      { chatId: req.params.chatId, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

// Get all chats for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user._id
    })
    .populate('members', 'username avatar')
    .populate('lastMessage');

    // Format chats to include otherUser
    const formattedChats = chats.map(chat => {
      const otherUser = chat.members.find(member => member._id.toString() !== req.user._id.toString());
      return {
        ...chat.toObject(),
        otherUser
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

export default router; 