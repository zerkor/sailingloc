const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const OwnerDocument = require('../models/OwnerDocument');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail, sendWelcomeOwnerEmail, sendWelcomeTenantEmail } = require('../services/emailService');
const { emailConfig } = require('../config/email');
const { requireTurnstile } = require('../services/turnstileService');

const RESET_TOKEN_TTL_MINUTES = 30;

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = asyncHandler(async (req, res) => {
  await requireTurnstile(req);
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
  const emailResult = user.role === 'owner' ? await sendWelcomeOwnerEmail(user) : await sendWelcomeTenantEmail(user);
  const token = generateToken(user._id);
  res.status(201).json({ token, user, emailSent: emailResult.success === true });
});

const login = asyncHandler(async (req, res) => {
  if (req.body.turnstileToken) await requireTurnstile(req);
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

const forgotPassword = asyncHandler(async (req, res) => {
  const genericResponse = {
    message: 'Si un compte existe pour cet email, un lien de réinitialisation sera envoyé.',
  };
  const user = await User.findOne({ email: req.body.email }).select('+passwordResetToken +passwordResetExpires');

  if (!user || !user.isActive) {
    return res.json(genericResponse);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${emailConfig.clientUrl}/reset-password/${resetToken}`;

  try {
    const emailResult = await sendPasswordResetEmail({ user, resetUrl });
    if (!emailResult.success) throw new Error(emailResult.error || 'EMAIL_NOT_SENT');
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Impossible d'envoyer l'email de réinitialisation. Vérifiez la configuration SMTP.");
  }

  res.json(genericResponse);
});

const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = hashResetToken(req.params.token);
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
    isActive: true,
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    res.status(400);
    throw new Error('Lien de réinitialisation invalide ou expiré');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Mot de passe réinitialisé avec succès' });
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
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
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

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword, exportMyData, anonymizeMe };
