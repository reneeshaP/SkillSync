import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import Session from '../models/Session.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const myChats = await Chat.find({ members: userId }).select('_id');
    const chatIds = myChats.map(c => c._id);

    const [unreadMessages, pendingConnectionRequests, pendingSessionRequests, confirmedSessions] = await Promise.all([
      Message.countDocuments({
        chatId: { $in: chatIds },
        sender: { $ne: userId },
        readBy: { $ne: userId }
      }),
      ConnectionRequest.countDocuments({ receiver: userId, status: 'pending' }),
      req.user.role === 'mentor'
        ? Session.countDocuments({ mentor: userId, status: 'pending' })
        : 0,
      Session.find({
        $or: [{ mentor: userId }, { mentee: userId }],
        status: 'confirmed'
      }).populate('slot')
    ]);

    const upcomingSessions = confirmedSessions.filter(s => s.slot?.startTime > new Date()).length;

    res.json({
      unreadMessages,
      pendingConnectionRequests,
      pendingSessionRequests,
      upcomingSessions
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  }
});

export default router;
