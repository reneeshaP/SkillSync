import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import AvailabilitySlot from '../models/AvailabilitySlot.js';
import Chat from '../models/Chat.js';
import { buildProfileText, getEmbedding } from '../services/embedding.service.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

const router = express.Router();

// Get AI-matched recommendations for the logged-in user — mentees are matched
// against mentors, and mentors are matched against mentees, symmetrically.
router.get('/recommend', authenticateToken, async (req, res) => {
    try {
        const targetRole = req.user.role === 'mentor' ? 'mentee' : 'mentor';

        const myText = buildProfileText(req.user);
        if (!myText) {
            return res.status(400).json({
                message: 'Add skills, a bio, or experience to your profile to get recommendations'
            });
        }

        let myEmbedding;
        try {
            myEmbedding = await getEmbedding(myText);
        } catch (err) {
            return res.status(503).json({
                message: 'AI matching is not available right now',
                error: err.message
            });
        }

        const candidates = await User.find({
            role: targetRole,
            _id: { $ne: req.user.id },
            embedding: { $exists: true, $ne: [] }
        }).select('username avatar bio skills experience embedding averageRating reviewCount');

        const ranked = candidates
            .map((candidate) => ({
                user: {
                    _id: candidate._id,
                    username: candidate.username,
                    avatar: candidate.avatar,
                    bio: candidate.bio,
                    skills: candidate.skills,
                    experience: candidate.experience,
                    role: targetRole,
                    averageRating: candidate.averageRating,
                    reviewCount: candidate.reviewCount
                },
                matchPercent: Math.round(
                    Math.max(0, cosineSimilarity(myEmbedding, candidate.embedding)) * 100
                )
            }))
            .sort((a, b) => b.matchPercent - a.matchPercent)
            .slice(0, 5);

        // Mentees browsing mentor matches get each mentor's soonest open slot
        // inline, so "book a slot right now" doesn't require opening the modal first.
        if (targetRole === 'mentor' && ranked.length > 0) {
            const mentorIds = ranked.map((r) => r.user._id);
            const nextSlots = await AvailabilitySlot.aggregate([
                { $match: { mentor: { $in: mentorIds }, status: 'open', endTime: { $gt: new Date() } } },
                { $sort: { startTime: 1 } },
                { $group: { _id: '$mentor', startTime: { $first: '$startTime' }, endTime: { $first: '$endTime' } } }
            ]);
            const slotByMentor = new Map(nextSlots.map((s) => [s._id.toString(), { startTime: s.startTime, endTime: s.endTime }]));
            ranked.forEach((r) => {
                r.user.nextAvailableSlot = slotByMentor.get(r.user._id.toString()) || null;
            });
        }

        // Already-connected matches get a "Message" action instead of "Connect" —
        // a Chat only ever exists once a connection request has been accepted.
        if (ranked.length > 0) {
            const myChats = await Chat.find({ members: req.user.id }).select('members');
            const connectedIds = new Set();
            myChats.forEach((chat) => {
                chat.members.forEach((memberId) => {
                    if (memberId.toString() !== req.user.id) connectedIds.add(memberId.toString());
                });
            });
            ranked.forEach((r) => {
                r.user.isConnected = connectedIds.has(r.user._id.toString());
            });
        }

        res.json(ranked);
    } catch (err) {
        res.status(500).json({ message: 'Error generating recommendations', error: err.message });
    }
});

export default router;
