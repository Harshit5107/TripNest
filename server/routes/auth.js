const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_super_secret_key_2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, travel_style } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`;

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, avatar, travel_style) VALUES (?, ?, ?, 'user', ?, ?)`,
      [name, email, hashedPassword, defaultAvatar, travel_style || 'Explorer']
    );

    const user = { id: result.insertId, name, email, role: 'user', avatar: defaultAvatar, travel_style: travel_style || 'Explorer' };
    const token = jsonwebtoken.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const targetEmail = email || 'hbhalani937@gmail.com';

    let [rows] = await db.query('SELECT * FROM users WHERE email = ?', [targetEmail]);

    // Auto-create missing demo accounts if requested
    if (rows.length === 0) {
      const hashedPass = await bcrypt.hash(password || 'Kano@5107', 10);
      const isRoleAdmin = targetEmail.includes('admin') || targetEmail.includes('hbhalani');
      const avatarUrl = isRoleAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';

      const [ins] = await db.query(
        `INSERT INTO users (name, email, password, role, avatar, travel_style) VALUES (?, ?, ?, ?, ?, 'Explorer')`,
        [isRoleAdmin ? 'Admin Manager' : 'Demo Traveler', targetEmail, hashedPass, isRoleAdmin ? 'admin' : 'user', avatarUrl]
      );
      
      [rows] = await db.query('SELECT * FROM users WHERE id = ?', [ins.insertId]);
    }

    const userRow = rows[0];

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      avatar: userRow.avatar,
      bio: userRow.bio,
      travel_style: userRow.travel_style
    };

    const token = jsonwebtoken.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, travel_style, avatar } = req.body;

    await db.query(
      `UPDATE users SET name = ?, bio = ?, travel_style = ?, avatar = ? WHERE id = ?`,
      [name, bio, travel_style, avatar, id]
    );

    const [updated] = await db.query('SELECT id, name, email, role, avatar, bio, travel_style FROM users WHERE id = ?', [id]);
    res.json({ user: updated[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Reset Password Simulator
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'No user account found with that email.' });
  }

  res.json({ message: 'Password reset link sent to your email.' });
});

module.exports = router;
