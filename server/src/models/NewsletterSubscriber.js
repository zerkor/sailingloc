const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    consent: { type: Boolean, required: true, default: true },
    consentAt: { type: Date, default: Date.now },
    source: { type: String, default: 'footer', maxlength: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
