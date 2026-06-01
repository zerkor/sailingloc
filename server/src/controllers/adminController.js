const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBoats, totalBookings, pendingBoats, pendingReviews, revenueResult] = await Promise.all([
    User.countDocuments(),
    Boat.countDocuments(),
    Booking.countDocuments(),
    Boat.countDocuments({ status: 'pending' }),
    Review.countDocuments({ status: 'pending' }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);
  const simulatedRevenue = revenueResult.length > 0 ? revenueResult[0].total * 0.1 : 0;
  res.json({ totalUsers, totalBoats, totalBookings, pendingBoats, pendingReviews, simulatedRevenue: Math.round(simulatedRevenue * 100) / 100 });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const { firstName, lastName, role, isActive } = req.body;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  const updated = await user.save();
  res.json(updated);
});

const disableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated' });
});

const getAdminBoats = asyncHandler(async (req, res) => {
  const boats = await Boat.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(boats);
});

const approveBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) { res.status(404); throw new Error('Boat not found'); }
  boat.status = 'approved';
  await boat.save();
  res.json(boat);
});

const rejectBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) { res.status(404); throw new Error('Boat not found'); }
  boat.status = 'rejected';
  await boat.save();
  res.json(boat);
});

const deleteBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) { res.status(404); throw new Error('Boat not found'); }
  await boat.deleteOne();
  res.json({ message: 'Boat deleted' });
});

const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('boat', 'title')
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const cancelAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
  await booking.save();
  res.json(booking);
});

const completeAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  booking.status = 'completed';
  await booking.save();
  res.json(booking);
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('author', 'firstName lastName')
    .populate('boat', 'title')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  review.status = 'approved';
  await review.save();
  const approvedReviews = await Review.find({ boat: review.boat, status: 'approved' });
  if (approvedReviews.length > 0) {
    const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    const Boat = require('../models/Boat');
    await Boat.findByIdAndUpdate(review.boat, { averageRating: Math.round(avg * 10) / 10 });
  }
  res.json(review);
});

const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  review.status = 'hidden';
  await review.save();
  res.json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  await review.deleteOne();
  res.json({ message: 'Review deleted' });
});

module.exports = { getStats, getUsers, updateUser, disableUser, getAdminBoats, approveBoat, rejectBoat, deleteBoat, getAdminBookings, cancelAdminBooking, completeAdminBooking, getReviews, approveReview, hideReview, deleteReview };
