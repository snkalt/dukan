const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// Get all users
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, gender, dob, is_admin FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new user
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, phone, gender, dob, password, is_admin } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, phone, gender, dob, password, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, email, phone, gender, dob, hashedPassword, is_admin || false]
    );
    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, gender, dob, is_admin } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name=$1, email=$2, phone=$3, gender=$4, dob=$5, is_admin=$6 WHERE id=$7',
      [name, email, phone, gender, dob, is_admin, userId]
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
