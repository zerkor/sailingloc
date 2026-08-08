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
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    if (activeAdmins <= 1) {
      res.status(400);
      throw new Error('Impossible de supprimer le dernier administrateur actif');
    }
  }

  user.isActive = false;
  user.email = `deleted_user_${user._id}@deleted.local`;
  user.firstName = 'Utilisateur';
  user.lastName = 'supprimé';
  user.phone = '';
  user.marketingConsent = false;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.anonymizedAt = new Date();
  await user.save();

  res.json({ message: 'Compte désactivé et anonymisé avec succès' });
});

module.exports = { getProfile, updateProfile, deleteAccount };
