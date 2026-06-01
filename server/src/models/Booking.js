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
      enum: ['pending', 'accepted', 'rejected', 'paid', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
