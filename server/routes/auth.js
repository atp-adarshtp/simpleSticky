require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const router = express.Router();

// Middleware to check API key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } 
  else {
    res.status(403).json({ message: 'Forbidden' });
  }
};
// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token Validation Error:', error.message); // Log the error message
    res.status(400).json({ message: "Invalid token" });
  }
};

// Signup route
router.post("/signup", authenticateApiKey, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ name });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { userId: user.userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Signin route
router.post("/signin", authenticateApiKey, async (req, res) => {
  const { name, password } = req.body;
  try {
    let user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { userId: user.userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    // Send token and userId to the client
    res.json({ token, userId: user.userId });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = { router, authenticateApiKey, authenticateToken };