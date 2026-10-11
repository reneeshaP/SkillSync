import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
export const registerUser = async (req, res) => {
  try {
    console.log("Signup body received:", req.body);  
    const { username, email, password, role } = req.body;

    console.log("Parsed fields =>", { username, email, password, role });

     if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingUser = await User.findOne({ email });
    console.log("Existing User Check:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      role,
    });

     console.log("User object to save:", user);

    await user.save();
    console.log("User saved successfully");

    // ✅ Create JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "User registered successfully",
    token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });



  } catch (error) {
     console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate token
    const token = jwt.sign(
      { _id: user._id,
         role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.status(200).json({ message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sign in / sign up with Google — verifies the ID token Google's identity
// widget hands back to the client, then finds or creates a matching user.
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const baseUsername = (name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase().slice(0, 20) || "user";
      let username = baseUsername;
      let suffix = 0;
      while (await User.findOne({ username })) {
        suffix += 1;
        username = `${baseUsername}${suffix}`;
      }

      user = new User({
        username,
        email,
        googleId,
        avatar: picture || "",
        role: "mentee",
        roleConfirmed: false,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        roleConfirmed: user.roleConfirmed,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ message: "Google authentication failed", error: error.message });
  }
};

// First-time Google signups land with a placeholder role — this lets them
// pick their real one before entering the app.
export const confirmRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ message: "role must be mentor or mentee" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role, roleConfirmed: true },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
