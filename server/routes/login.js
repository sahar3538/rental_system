const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// Login Route
router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare hashed password
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

      // Generate JWT Token
      const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.json({ success: true, user: results[0], token });
    });
  });
});

module.exports = router;
