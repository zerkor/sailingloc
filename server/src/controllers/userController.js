const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  const updated = await user.save();
  res.json(updated);
});

const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: 'Account deleted successfully' });
});

module.exports = { getProfile, updateProfile, deleteAccount };
