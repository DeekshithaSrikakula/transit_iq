const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ===============================
// REGISTER
// ===============================

router.post("/register", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const {
      name,
      email,
      password,
      role = "passenger",
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Allowed roles
    const allowedRoles = [
      "passenger",
      "driver",
      "operator",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check existing user
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: result.insertedId,
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const {
      email,
      password,
      role,
    } = req.body;

    // Check fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    // Find user
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
      role,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;