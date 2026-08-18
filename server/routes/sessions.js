import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import AvailabilitySlot from '../models/AvailabilitySlot.js';
import Session from '../models/Session.js';

const router = express.Router();

// Mentor: add an availability slot
router.post('/availability', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can add availability' });
    }

    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'startTime and endTime are required' });
    }
    if (new Date(startTime) <= new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    const slot = new AvailabilitySlot({
      mentor: req.user._id,
      startTime,
      endTime
    });
    await slot.save();

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Error adding availability', error: err.message });
  }
});

// Mentor: view their own availability slots (open and booked)
router.get('/availability/mine', authenticateToken, async (req, res) => {
  try {
    const slots = await AvailabilitySlot.find({ mentor: req.user._id }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching availability', error: err.message });
  }
});

// Anyone: view a specific mentor's OPEN slots (for booking)
router.get('/availability/:mentorId', authenticateToken, async (req, res) => {
  try {
    const slots = await AvailabilitySlot.find({
      mentor: req.params.mentorId,
      status: 'open',
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching availability', error: err.message });
  }
});

// Mentor: remove an unbooked slot
router.delete('/availability/:slotId', authenticateToken, async (req, res) => {
  try {
    const slot = await AvailabilitySlot.findOne({ _id: req.params.slotId, mentor: req.user._id });
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    if (slot.status === 'booked') {
      return res.status(400).json({ message: 'Cannot remove a booked slot — cancel the session first' });
    }
    await AvailabilitySlot.deleteOne({ _id: slot._id });
    res.json({ message: 'Slot removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing slot', error: err.message });
  }
});

// Mentee: book a slot
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const { slotId, topic } = req.body;
    if (!slotId) {
      return res.status(400).json({ message: 'slotId is required' });
    }

    const slot = await AvailabilitySlot.findById(slotId);
    if (!slot || slot.status !== 'open') {
      return res.status(400).json({ message: 'This slot is no longer available' });
    }
    if (slot.mentor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own slot' });
    }

    slot.status = 'booked';
    await slot.save();

    const session = new Session({
      mentor: slot.mentor,
      mentee: req.user._id,
      slot: slot._id,
      topic: topic?.trim() || ''
    });
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('mentor', 'username avatar')
      .populate('mentee', 'username avatar')
      .populate('slot');

    res.status(201).json(populatedSession);
  } catch (err) {
    res.status(500).json({ message: 'Error booking session', error: err.message });
  }
});

// Get all sessions (as mentor or mentee) for the logged-in user
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }]
    })
      .populate('mentor', 'username avatar')
      .populate('mentee', 'username avatar')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions', error: err.message });
  }
});

// Mentor: confirm or decline a pending session request
router.put('/:sessionId/respond', authenticateToken, async (req, res) => {
  try {
    const { accept } = req.body;
    const session = await Session.findOne({ _id: req.params.sessionId, mentor: req.user._id, status: 'pending' })
      .populate('mentor', 'username avatar')
      .populate('mentee', 'username avatar')
      .populate('slot');

    if (!session) {
      return res.status(404).json({ message: 'Pending session request not found' });
    }

    session.status = accept ? 'confirmed' : 'declined';
    await session.save();

    if (!accept) {
      await AvailabilitySlot.findByIdAndUpdate(session.slot._id, { status: 'open' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Error responding to session', error: err.message });
  }
});

// Either party: cancel a pending or confirmed session
router.put('/:sessionId/cancel', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }],
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'cancelled';
    await session.save();
    await AvailabilitySlot.findByIdAndUpdate(session.slot, { status: 'open' });

    res.json({ message: 'Session cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling session', error: err.message });
  }
});

export default router;
