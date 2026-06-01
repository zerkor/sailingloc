const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Boat = require('../models/Boat');
const calculateBookingPrice = require('../utils/calculateBookingPrice');

const createBooking = asyncHandler(async (req, res) => {
  const { boatId, startDate, endDate } = req.body;
  const boat = await Boat.findById(boatId);
  if (!boat || boat.status !== 'approved') {
    res.status(400);
    throw new Error('Boat not available for booking');
  }
  if (boat.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot book your own boat');
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    res.status(400);
    throw new Error('Start date must be before end date');
  }
  if (start < new Date()) {
    res.status(400);
    throw new Error('Start date cannot be in the past');
  }
  const { numberOfDays, pricePerDay, serviceFee, totalPrice } = calculateBookingPrice(startDate, endDate, boat.pricePerDay);
  const booking = await Booking.create({
    boat: boatId,
    tenant: req.user._id,
    owner: boat.owner,
    startDate: start,
    endDate: end,
    numberOfDays,
    pricePerDay,
    serviceFee,
    totalPrice,
  });
  const populated = await Booking.findById(booking._id)
    .populate('boat', 'title images location')
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email');
  res.status(201).json(populated);
});

const getTenantBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ tenant: req.user._id })
    .populate('boat', 'title images location type')
    .populate('owner', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const getOwnerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id })
    .populate('boat', 'title images location type')
    .populate('tenant', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.owner.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'pending') { res.status(400); throw new Error('Booking cannot be accepted in its current state'); }
  booking.status = 'accepted';
  await booking.save();
  res.json(booking);
});

const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.owner.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (!['pending'].includes(booking.status)) { res.status(400); throw new Error('Booking cannot be rejected in its current state'); }
  booking.status = 'rejected';
  await booking.save();
  res.json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  const isTenant = booking.tenant.toString() === req.user._id.toString();
  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isTenant && !isOwner && !isAdmin) { res.status(403); throw new Error('Not authorized'); }
  if (!['pending', 'accepted', 'confirmed'].includes(booking.status)) {
    res.status(400);
    throw new Error('Booking cannot be cancelled in its current state');
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
  await booking.save();
  res.json(booking);
});

const payBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.tenant.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'accepted') { res.status(400); throw new Error('Booking must be accepted before payment'); }
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  await booking.save();
  res.json(booking);
});

const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'confirmed') { res.status(400); throw new Error('Booking must be confirmed before completing'); }
  booking.status = 'completed';
  await booking.save();
  res.json(booking);
});

module.exports = { createBooking, getTenantBookings, getOwnerBookings, acceptBooking, rejectBooking, cancelBooking, payBooking, completeBooking };
