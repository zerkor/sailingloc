const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Boat = require('../models/Boat');
const Payment = require('../models/Payment');
const calculateBookingPrice = require('../utils/calculateBookingPrice');
const { assertBoatAvailable } = require('../utils/bookingAvailability');
const createNotification = require('../utils/createNotification');

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

  await assertBoatAvailable({ boat, startDate: start, endDate: end });

  const { numberOfDays, pricePerDay, serviceFee, totalPrice } = calculateBookingPrice(
    startDate,
    endDate,
    boat.pricePerDay
  );
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
  await createNotification({
    user: boat.owner,
    type: 'booking_created',
    title: 'Nouvelle demande de reservation',
    message: `${req.user.firstName} souhaite reserver ${boat.title}.`,
    relatedBooking: booking._id,
    relatedBoat: boat._id,
  });
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
  const booking = await Booking.findById(req.params.id).populate('boat');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('Booking cannot be accepted in its current state');
  }
  await assertBoatAvailable({
    boat: booking.boat,
    startDate: booking.startDate,
    endDate: booking.endDate,
    excludedBookingId: booking._id,
  });
  booking.status = 'accepted';
  await booking.save();
  await createNotification({
    user: booking.tenant,
    type: 'booking_accepted',
    title: 'Reservation acceptee',
    message: `Votre demande pour ${booking.boat.title} a ete acceptee. Vous pouvez proceder au paiement.`,
    relatedBooking: booking._id,
    relatedBoat: booking.boat._id,
  });
  res.json(booking);
});

const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (!['pending'].includes(booking.status)) {
    res.status(400);
    throw new Error('Booking cannot be rejected in its current state');
  }
  booking.status = 'rejected';
  await booking.save();
  await createNotification({
    user: booking.tenant,
    type: 'booking_rejected',
    title: 'Reservation refusee',
    message: 'Le proprietaire a refuse votre demande de reservation.',
    relatedBooking: booking._id,
    relatedBoat: booking.boat,
  });
  res.json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isTenant = booking.tenant.toString() === req.user._id.toString();
  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isTenant && !isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (!['pending', 'accepted', 'confirmed'].includes(booking.status)) {
    res.status(400);
    throw new Error('Booking cannot be cancelled in its current state');
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
  await booking.save();
  if (booking.payment) {
    await Payment.findByIdAndUpdate(booking.payment, { status: 'refunded', refundedAt: new Date() });
  }
  const notifyUser = isTenant ? booking.owner : booking.tenant;
  await createNotification({
    user: notifyUser,
    type: 'booking_cancelled',
    title: 'Reservation annulee',
    message: 'Une reservation a ete annulee sur SailingLoc.',
    relatedBooking: booking._id,
    relatedBoat: booking.boat,
  });
  res.json(booking);
});

const payBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.tenant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'accepted') {
    res.status(400);
    throw new Error('Booking must be accepted before payment');
  }
  const existingPayment = await Payment.findOne({ booking: booking._id });
  if (existingPayment && existingPayment.status === 'succeeded') {
    res.status(400);
    throw new Error('Booking already paid');
  }
  const payment =
    existingPayment ||
    (await Payment.create({
      booking: booking._id,
      tenant: booking.tenant,
      owner: booking.owner,
      amount: booking.totalPrice,
      serviceFee: booking.serviceFee,
      providerReference: `sim_stripe_${booking._id.toString()}`,
    }));
  payment.status = 'succeeded';
  payment.paidAt = new Date();
  await payment.save();
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.payment = payment._id;
  await booking.save();
  await createNotification({
    user: booking.owner,
    type: 'booking_paid',
    title: 'Paiement confirme',
    message: 'Le paiement de la reservation a ete valide.',
    relatedBooking: booking._id,
    relatedBoat: booking.boat,
  });
  res.json(booking);
});

const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'confirmed') {
    res.status(400);
    throw new Error('Booking must be confirmed before completing');
  }
  booking.status = 'completed';
  await booking.save();
  res.json(booking);
});

module.exports = {
  createBooking,
  getTenantBookings,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  payBooking,
  completeBooking,
};
