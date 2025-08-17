const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/** POST /api/auth/register */
const registerUser = async (req, res) => {
  try {
    const { name = '', email = '', password = '', address } = req.body || {};
    if (!name.trim() || !email.trim() || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const lowerEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: lowerEmail });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    // IMPORTANT: set plain password; model pre-save will hash it
    const user = await User.create({
      name: name.trim(),
      email: lowerEmail,
      password,
      address,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/** POST /api/auth/login */
const loginUser = async (req, res) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // select('+password') so we can compare
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/** GET /api/auth/profile (protected) */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/** PUT /api/auth/profile (protected) */
const updateUserProfile = async (req, res) => {
  try {
    // select password so pre-save can hash if we change it
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, address, password } = req.body || {};
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (address !== undefined) user.address = address;
    if (password) user.password = password; // plain; pre-save will hash

    const updated = await user.save();
    return res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      address: updated.address,
      role: updated.role,
      token: generateToken(updated.id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
