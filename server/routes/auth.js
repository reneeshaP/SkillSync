import express from "express";
import { registerUser, loginUser, googleAuth, confirmRole } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.put("/confirm-role", authenticateToken, confirmRole);

// Verify token and get user data
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
