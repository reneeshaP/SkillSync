import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

const recomputeMentorRating = async (mentorId) => {
  const stats = await Review.aggregate([
    { $match: { mentor: new mongoose.Types.ObjectId(mentorId) } },
    { $group: { _id: '$mentor', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await User.findByIdAndUpdate(mentorId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count
  });
};

// Create or update a review for a mentor (one per mentee per mentor)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mentorId, sessionId, rating, comment } = req.body;

    if (!mentorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'mentorId and a rating from 1-5 are required' });
    }

    const hasSession = await Session.exists({
      mentor: mentorId,
      mentee: req.user._id,
      status: 'confirmed'
    });
    if (!hasSession) {
      return res.status(403).json({ message: 'You can only review a mentor after a confirmed session with them' });
    }

    const review = await Review.findOneAndUpdate(
      { mentor: mentorId, mentee: req.user._id },
      { rating, comment: comment?.trim() || '', session: sessionId || undefined },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recomputeMentorRating(mentorId);

    const populatedReview = await Review.findById(review._id).populate('mentee', 'username avatar');
    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(500).json({ message: 'Error saving review', error: err.message });
  }
});

// Get all reviews for a mentor
router.get('/mentor/:mentorId', authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find({ mentor: req.params.mentorId })
      .populate('mentee', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

// Get the logged-in mentee's own review for a specific mentor (to pre-fill an edit form)
router.get('/mine/:mentorId', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({ mentor: req.params.mentorId, mentee: req.user._id });
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching review', error: err.message });
  }
});

// Delete your own review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, mentee: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const mentorId = review.mentor;
    await Review.deleteOne({ _id: review._id });
    await recomputeMentorRating(mentorId);

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
});

export default router;
