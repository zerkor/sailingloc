const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Boat = require('../models/Boat');

const createReview = asyncHandler(async (req, res) => {
  const { boatId, bookingId, rating, comment } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review completed bookings');
  }
  if (booking.tenant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.boat.toString() !== boatId) {
    res.status(400);
    throw new Error('Booking does not match boat');
  }
  const existing = await Review.findOne({ booking: bookingId, author: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this booking');
  }
  const review = await Review.create({
    boat: boatId,
    booking: bookingId,
    author: req.user._id,
    rating,
    comment,
    status: 'pending',
  });
  // Update average rating
  const approvedReviews = await Review.find({ boat: boatId, status: 'approved' });
  if (approvedReviews.length > 0) {
    const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    await Boat.findByIdAndUpdate(boatId, { averageRating: Math.round(avg * 10) / 10 });
  }
  res.status(201).json(review);
});

const getBoatReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ boat: req.params.id, status: 'approved' })
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

module.exports = { createReview, getBoatReviews };
