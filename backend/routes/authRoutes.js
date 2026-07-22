const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------------------------------------------------------------------
// POST /api/auth/register
// Registers a COMPANY or a STUDENT. Admin accounts are seeded separately
// (see utils/seedAdmin.js) and cannot be self-registered, for security.
// body: { name, email, password, role: 'company' | 'student' }
// ---------------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["company", "student"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'company' or 'student'" });
    }

    const existing = db.findOne("users", (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = db.insert("users", {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    // Create the linked profile row so the dashboards have something to edit
    if (role === "company") {
      db.insert("companies", {
        userId: user.id,
        companyName: name,
        industry: "",
        location: "",
        website: "",
        description: "",
        requirements: "",
        status: "pending", // waits for admin approval
      });
    } else if (role === "student") {
      db.insert("students", {
        userId: user.id,
        course: "",
        branch: "",
        cgpa: "",
        skills: "",
        phone: "",
        resumePath: "",
        resumeOriginalName: "",
      });
    }

    const token = signToken(user);
    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration" });
  }
});

// ---------------------------------------------------------------------
// POST /api/auth/login
// Works for all three roles (admin, company, student)
// body: { email, password }
// ---------------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = db.findOne("users", (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
