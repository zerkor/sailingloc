const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat' },
    amount: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR', uppercase: true },
    provider: { type: String, enum: ['simulated', 'stripe', 'simulated-stripe'], default: 'simulated' },
    providerReference: { type: String },
    status: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'requires_capture', 'succeeded'],
      default: 'unpaid',
    },
    stripeCheckoutSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    stripeCustomerEmail: { type: String, trim: true, lowercase: true },
    paidAt: Date,
    refundedAt: Date,
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    invoiceNumber: { type: String, trim: true },
    invoiceUrl: { type: String, trim: true },
    invoiceGeneratedAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ tenant: 1, createdAt: -1 });
paymentSchema.index({ owner: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
