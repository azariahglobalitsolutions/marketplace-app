const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");

const router = express.Router();

router.post("/register", (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({ error: "Email or phone and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = query.get(
    "SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)",
    [email || null, phone || null]
  );

  if (existing) {
    return res.status(409).json({ error: "Account already exists with this email or phone" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = query.run(
    "INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)",
    [email || null, phone || null, passwordHash]
  );

  const user = query.get("SELECT id, email, phone, role FROM users WHERE id = ?", [result.lastInsertRowid]);
  const token = jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token, user });
});

router.post("/login", (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({ error: "Email or phone and password are required" });
  }

  const user = query.get(
    "SELECT * FROM users WHERE email = ? OR phone = ?",
    [email || null, phone || null]
  );

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
  });
});

router.get("/me", require("../middleware/auth").authenticate, (req, res) => {
  const user = query.get("SELECT id, email, phone, role FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

module.exports = router;
