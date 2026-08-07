const asyncHandler = require('../utils/asyncHandler');
const ContactMessage = require('../models/ContactMessage');
const logAdminAction = require('../utils/adminActionLog');
const { parsePagination, paginatedResponse } = require('../utils/paginate');
const { sendContactMessageEmail } = require('../services/emailService');
const { requireTurnstile } = require('../services/turnstileService');

const createContactMessage = asyncHandler(async (req, res) => {
  await requireTurnstile(req);

  const message = await ContactMessage.create({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  const emailResult = await sendContactMessageEmail({ contactMessage: message });
  message.emailNotification = {
    sent: emailResult.success,
    skipped: emailResult.skipped || false,
    provider: emailResult.provider,
    messageId: emailResult.messageId,
    error: emailResult.error,
    sentAt: emailResult.success && !emailResult.skipped ? new Date() : undefined,
  };
  await message.save();

  res.status(201).json({
    message: 'Message recu. Notre equipe vous repondra rapidement.',
    id: message._id,
    emailSent: emailResult.success,
    emailSkipped: emailResult.skipped || false,
  });
});

const getAdminContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  res.json(paginatedResponse(items, page, limit, total));
});

const updateAdminContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message contact introuvable');
  }

  if (req.body.status) message.status = req.body.status;
  if (req.body.adminNote !== undefined) message.adminNote = req.body.adminNote;
  await message.save();

  await logAdminAction({
    admin: req.user._id,
    action: 'update_contact_message',
    entityType: 'contactMessage',
    entityId: message._id,
    description: `Message contact ${message.email} marque ${message.status}`,
  });

  res.json(message);
});

module.exports = {
  createContactMessage,
  getAdminContactMessages,
  updateAdminContactMessage,
};
