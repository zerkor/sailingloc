const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

bookingSchema.index({ boat: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ tenant: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
