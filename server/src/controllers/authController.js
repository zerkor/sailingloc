const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already in use');
  }
  const allowedRoles = ['tenant', 'owner'];
  const userRole = allowedRoles.includes(role) ? role : 'tenant';
  const user = await User.create({ firstName, lastName, email, password, phone, role: userRole });
  const token = generateToken(user._id);
  res.status(201).json({ token, user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid credentials or account deactivated');
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = generateToken(user._id);
  res.json({ token, user });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, logout };
