// routes/profile.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { changePassword } from '../controllers/profileController.js';
import { updateUserEmbedding } from '../services/embedding.service.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Avatars and resumes upload straight to Cloudinary rather than local disk,
// since most hosts (Render included) wipe local files on every redeploy/restart.
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'skillsync/avatars', resource_type: 'image' },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadConfig = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'skillsync/resumes', resource_type: 'raw' },
});

const resumeFileFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase() === '.pdf';
    const mimetype = file.mimetype === 'application/pdf';

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const resumeUploadConfig = multer({
    storage: resumeStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: resumeFileFilter
});

// Protected routes - require authentication
router.get("/", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/", authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password updates through this route

        // Skills/bio feed the AI matching embedding — don't let an edit silently
        // blank them out once a profile has been completed via onboarding.
        if ('skills' in updates && (!Array.isArray(updates.skills) || updates.skills.filter(s => s && s.trim()).length === 0)) {
            return res.status(400).json({ message: "Skills cannot be empty" });
        }
        if ('bio' in updates && !updates.bio?.trim()) {
            return res.status(400).json({ message: "Bio cannot be empty" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select("-password");

        // Recompute the AI match embedding whenever a profile changes (mentors and
        // mentees both need one so matching works symmetrically). Failures here
        // shouldn't block the profile update itself (e.g. no GEMINI_API_KEY yet).
        if (user) {
            try {
                await updateUserEmbedding(user);
            } catch (embeddingError) {
                console.error('Error updating embedding:', embeddingError.message);
            }
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error updating profile" });
    }
});

// Mandatory post-signup step — collects the fields the AI mentor-matching
// embedding actually needs, and is the only thing that can set profileCompleted.
router.put("/complete-onboarding", authenticateToken, async (req, res) => {
    try {
        const { skills, bio, experience, socialLinks } = req.body;

        if (!Array.isArray(skills) || skills.filter(s => s && s.trim()).length === 0) {
            return res.status(400).json({ message: "Please add at least one skill" });
        }
        if (!bio?.trim()) {
            return res.status(400).json({ message: "Please add a short bio" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    skills,
                    bio,
                    experience: experience || '',
                    socialLinks: socialLinks || {},
                    profileCompleted: true,
                }
            },
            { new: true }
        ).select("-password");

        if (user) {
            try {
                await updateUserEmbedding(user);
            } catch (embeddingError) {
                console.error('Error updating embedding:', embeddingError.message);
            }
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error completing onboarding", error: err.message });
    }
});

router.put("/avatar", authenticateToken, uploadConfig.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const avatarPath = req.file.path;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { avatar: avatarPath } },
            { new: true }
        ).select("-password");
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error uploading avatar" });
    }
});

router.put("/resume", authenticateToken, resumeUploadConfig.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const resumeUrl = req.file.path;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { resume: { url: resumeUrl, filename: req.file.originalname } } },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error uploading resume" });
    }
});

// Change password route
router.put("/change-password", authenticateToken, changePassword);

// Public-ish view of another user's profile — deliberately excludes
// email/phone/address/embedding. Kept last so it doesn't shadow the
// literal routes above (e.g. "/avatar" would otherwise match ":id").
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("username avatar bio skills experience role socialLinks resume averageRating reviewCount");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // A Chat only ever exists between two users once they've connected
        // (created on request acceptance), so its presence is the "connected" signal.
        const existingChat = await Chat.findOne({ members: { $all: [req.user.id, req.params.id] } });

        res.json({ ...user.toObject(), isConnected: !!existingChat });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

export default router;
