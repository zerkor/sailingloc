const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR' },
    provider: { type: String, enum: ['simulated-stripe'], default: 'simulated-stripe' },
    providerReference: { type: String, required: true },
    status: {
      type: String,
      enum: ['requires_capture', 'succeeded', 'refunded', 'failed'],
      default: 'requires_capture',
    },
    paidAt: Date,
    refundedAt: Date,
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.index({ tenant: 1, createdAt: -1 });
paymentSchema.index({ owner: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
