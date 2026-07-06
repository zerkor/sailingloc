const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const OwnerDocument = require('../models/OwnerDocument');
const generateToken = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role, privacyConsent, marketingConsent } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already in use');
  }
  const allowedRoles = ['tenant', 'owner'];
  const userRole = allowedRoles.includes(role) ? role : 'tenant';
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: userRole,
    privacyConsent: privacyConsent === true || privacyConsent === 'true',
    privacyConsentAt: new Date(),
    marketingConsent: marketingConsent === true || marketingConsent === 'true',
  });
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

const exportMyData = asyncHandler(async (req, res) => {
  const [bookingsAsTenant, bookingsAsOwner, reviews, payments, documents] = await Promise.all([
    Booking.find({ tenant: req.user._id }).lean(),
    Booking.find({ owner: req.user._id }).lean(),
    Review.find({ author: req.user._id }).lean(),
    Payment.find({ $or: [{ tenant: req.user._id }, { owner: req.user._id }] }).lean(),
    OwnerDocument.find({ owner: req.user._id }).lean(),
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    user: req.user.toJSON(),
    bookingsAsTenant,
    bookingsAsOwner,
    reviews,
    payments,
    documents,
  });
});

const anonymizeMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const suffix = user._id.toString().slice(-8);
  user.firstName = 'Utilisateur';
  user.lastName = 'Anonymise';
  user.email = `deleted-${suffix}@sailingloc.local`;
  user.phone = undefined;
  user.isActive = false;
  user.privacyConsent = false;
  user.marketingConsent = false;
  user.anonymizedAt = new Date();
  await user.save();
  res.json({ message: 'Account anonymized', anonymizedAt: user.anonymizedAt });
});

module.exports = { register, login, getMe, logout, exportMyData, anonymizeMe };
