const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending' },
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1, author: 1 }, { unique: true });
reviewSchema.index({ boat: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
