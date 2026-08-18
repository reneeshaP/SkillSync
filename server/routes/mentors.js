import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
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

        res.json(ranked);
    } catch (err) {
        res.status(500).json({ message: 'Error generating recommendations', error: err.message });
    }
});

export default router;
