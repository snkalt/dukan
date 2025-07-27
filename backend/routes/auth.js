const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { createUser, findUserByEmail } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to validate signup input
function validateSignup(data) {
  const { name, email, phone, gender, dob, password, confirmPassword } = data;

  if (!name || !email || !phone || !gender || !dob || !password || !confirmPassword) {
    return 'All fields are required';
  }

  // Basic email regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  // Add more validations as needed (phone format, gender values, etc.)

  return null; // no errors
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const error = validateSignup(req.body);
    if (error) return res.status(400).json({ error });

    const { name, email, phone, gender, dob, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = await createUser({ name, email, phone, gender, dob, password });

    // Don't send password back
    delete newUser.password;

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const tokenPayload = { id: user.id, is_admin: user.is_admin };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
