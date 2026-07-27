const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    subject: {
      type: String,
      enum: ['technique', 'location', 'partenariat', 'autre'],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['new', 'read', 'resolved', 'archived'],
      default: 'new',
    },
    adminNote: { type: String, trim: true, maxlength: 1000 },
    emailNotification: {
      sent: { type: Boolean, default: false },
      skipped: { type: Boolean, default: false },
      provider: { type: String, trim: true },
      messageId: { type: String, trim: true },
      error: { type: String, trim: true },
      sentAt: Date,
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
