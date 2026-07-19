const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const router = express.Router();

// Basic international mobile check. Adjust to require +91 specifically if you want to lock to India only.
function isValidMobile(mobile) {
  return typeof mobile === 'string' && /^\+?[1-9]\d{7,14}$/.test(mobile.trim());
}

function signToken(user) {
  return jwt.sign({ id: user.id, mobile: user.mobile }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// Slow down brute-force attempts on login/signup/forgot: 10 requests / 15 min / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' }
});

// --- POST /api/auth/signup ---
// body: { mobile, password }
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!isValidMobile(mobile) || !password || password.length < 6) {
      return res.status(400).json({ error: 'A valid mobile number and a password of at least 6 characters are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This mobile is already registered. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (mobile, password_hash) VALUES (?, ?)',
      [mobile, passwordHash]
    );

    const token = signToken({ id: result.insertId, mobile });
    res.status(201).json({ token, mobile });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// --- POST /api/auth/login ---
// body: { mobile, password }
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!isValidMobile(mobile) || !password) {
      return res.status(400).json({ error: 'Mobile and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this mobile. Please join first.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = signToken(user);
    res.json({ token, mobile: user.mobile });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Failed to sign in.' });
  }
});

// --- POST /api/auth/forgot-password ---
// body: { mobile, newPassword }
// NOTE: since OTP was removed, this resets the password from the mobile number
// alone with no ownership check. That's fine for a demo/internal tool, but before
// going live you'll want *some* verification step (e.g. a reset link emailed to
// an address on file) so anyone who knows a customer's phone number can't hijack
// their account. Happy to wire that up if/when you're ready.
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { mobile, newPassword } = req.body;
    if (!isValidMobile(mobile) || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mobile and a new password of at least 6 characters are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this mobile.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE mobile = ?', [passwordHash, mobile]);

    const token = signToken(rows[0]);
    res.json({ token, mobile });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

module.exports = router;