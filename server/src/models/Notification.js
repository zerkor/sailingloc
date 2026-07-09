const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_accepted',
        'booking_rejected',
        'booking_paid',
        'booking_cancelled',
        'document_submitted',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    relatedBoat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat' },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
