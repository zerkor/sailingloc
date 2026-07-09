const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const OwnerDocument = require('../models/OwnerDocument');
const AdminActionLog = require('../models/AdminActionLog');
const recalculateBoatRating = require('../utils/recalculateBoatRating');
const logAdminAction = require('../utils/adminActionLog');
const { parsePagination, paginatedResponse } = require('../utils/paginate');

const roleValues = ['tenant', 'owner', 'admin'];

const adminName = (req) => `${req.user.firstName || 'Admin'} ${req.user.lastName || ''}`.trim();

const assertAdminChangeAllowed = async ({ targetUser, currentAdminId, nextRole, nextIsActive }) => {
  const isSelf = targetUser._id.toString() === currentAdminId.toString();
  const downgradingAdmin = targetUser.role === 'admin' && nextRole && nextRole !== 'admin';
  const deactivatingAdmin = targetUser.role === 'admin' && nextIsActive === false;

  if (nextRole && !roleValues.includes(nextRole)) {
    const error = new Error('Role invalide');
    error.statusCode = 400;
    throw error;
  }

  if (isSelf && nextIsActive === false) {
    const error = new Error('Un administrateur ne peut pas desactiver son propre compte');
    error.statusCode = 403;
    throw error;
  }

  if (isSelf && downgradingAdmin) {
    const error = new Error('Un administrateur ne peut pas retirer son propre role admin');
    error.statusCode = 403;
    throw error;
  }

  if (downgradingAdmin || deactivatingAdmin) {
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    if (activeAdmins <= 1 && targetUser.isActive) {
      const error = new Error('Impossible de modifier le dernier administrateur actif');
      error.statusCode = 403;
      throw error;
    }
  }
};

const handlePolicyError = (res, error) => {
  if (error.statusCode) res.status(error.statusCode);
  throw error;
};

const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalTenants,
    totalOwners,
    totalBoats,
    approvedBoats,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    pendingBoats,
    pendingReviews,
    pendingDocuments,
    totalPayments,
    revenueResult,
    serviceFeeResult,
    refundedResult,
    openReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'tenant' }),
    User.countDocuments({ role: 'owner' }),
    Boat.countDocuments(),
    Boat.countDocuments({ status: 'approved' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Boat.countDocuments({ status: 'pending' }),
    Review.countDocuments({ status: 'pending' }),
    OwnerDocument.countDocuments({ status: 'pending' }),
    Payment.countDocuments({ status: 'succeeded' }),
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$serviceFee' } } }]),
    Payment.aggregate([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    require('../models/Report').countDocuments({ status: { $in: ['open', 'in_review'] } }),
  ]);

  const totalRevenue = Math.round((revenueResult[0]?.total || 0) * 100) / 100;
  const totalServiceFees = Math.round((serviceFeeResult[0]?.total || 0) * 100) / 100;
  const refundedAmount = Math.round((refundedResult[0]?.total || 0) * 100) / 100;

  res.json({
    totalUsers,
    totalTenants,
    totalOwners,
    totalBoats,
    approvedBoats,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    pendingBoats,
    pendingReviews,
    pendingDocuments,
    totalPayments,
    openReports,
    totalRevenue,
    totalServiceFees,
    refundedAmount,
    simulatedRevenue: totalServiceFees,
    totalPaidRevenue: totalRevenue,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
  }
  const [items, total, activeAdminCount] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
    User.countDocuments({ role: 'admin', isActive: true }),
  ]);
  res.json({ ...paginatedResponse(items, page, limit, total), activeAdminCount });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur introuvable');
  }

  const { firstName, lastName, role, isActive } = req.body;
  try {
    await assertAdminChangeAllowed({
      targetUser: user,
      currentAdminId: req.user._id,
      nextRole: role,
      nextIsActive: isActive,
    });
  } catch (error) {
    handlePolicyError(res, error);
  }

  const previous = { role: user.role, isActive: user.isActive };
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  const updated = await user.save();

  if (previous.role !== updated.role) {
    await logAdminAction({
      admin: req.user._id,
      action: 'change_user_role',
      entityType: 'user',
      entityId: updated._id,
      description: `${adminName(req)} a change le role de ${updated.email} en ${updated.role}`,
      metadata: previous,
    });
  }

  if (previous.isActive !== updated.isActive) {
    await logAdminAction({
      admin: req.user._id,
      action: updated.isActive ? 'reactivate_user' : 'deactivate_user',
      entityType: 'user',
      entityId: updated._id,
      description: `${adminName(req)} a ${updated.isActive ? 'reactive' : 'desactive'} ${updated.email}`,
      metadata: previous,
    });
  }

  res.json(updated);
});

const disableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur introuvable');
  }
  try {
    await assertAdminChangeAllowed({ targetUser: user, currentAdminId: req.user._id, nextIsActive: false });
  } catch (error) {
    handlePolicyError(res, error);
  }
  user.isActive = false;
  await user.save();
  await logAdminAction({
    admin: req.user._id,
    action: 'deactivate_user',
    entityType: 'user',
    entityId: user._id,
    description: `${adminName(req)} a desactive ${user.email}`,
  });
  res.json({ message: 'Utilisateur desactive' });
});

const getAdminBoats = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Boat.find(filter).populate('owner', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Boat.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, page, limit, total));
});

const approveBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) {
    res.status(404);
    throw new Error('Bateau introuvable');
  }
  const rejectedDocs = await OwnerDocument.countDocuments({ boat: boat._id, status: 'rejected' });
  if (rejectedDocs > 0) {
    res.status(400);
    throw new Error('Des documents lies a ce bateau sont rejetes');
  }
  boat.status = 'approved';
  await boat.save();
  await logAdminAction({
    admin: req.user._id,
    action: 'approve_boat',
    entityType: 'boat',
    entityId: boat._id,
    description: `${adminName(req)} a approuve ${boat.title}`,
  });
  res.json(boat);
});

const rejectBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) {
    res.status(404);
    throw new Error('Bateau introuvable');
  }
  boat.status = 'rejected';
  await boat.save();
  await logAdminAction({
    admin: req.user._id,
    action: 'reject_boat',
    entityType: 'boat',
    entityId: boat._id,
    description: `${adminName(req)} a rejete ${boat.title}`,
  });
  res.json(boat);
});

const deleteBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) {
    res.status(404);
    throw new Error('Bateau introuvable');
  }
  await boat.deleteOne();
  await logAdminAction({
    admin: req.user._id,
    action: 'delete_boat',
    entityType: 'boat',
    entityId: req.params.id,
    description: `${adminName(req)} a supprime ${boat.title}`,
  });
  res.json({ message: 'Bateau supprime' });
});

const getAdminBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('boat', 'title')
      .populate('tenant', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, page, limit, total));
});

const refundBookingPayment = async ({ booking, adminId }) => {
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';

  const payment = booking.payment
    ? await Payment.findById(booking.payment)
    : await Payment.findOne({ booking: booking._id });

  if (payment && payment.status === 'succeeded') {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundedBy = adminId;
    await payment.save();
    booking.payment = payment._id;
    booking.paymentStatus = 'refunded';
  }

  await booking.save();
  return { booking, payment };
};

const cancelAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
    res.status(400);
    throw new Error('La reservation ne peut pas etre annulee dans son etat actuel');
  }
  const result = await refundBookingPayment({ booking, adminId: req.user._id });
  await logAdminAction({
    admin: req.user._id,
    action: 'refund_payment',
    entityType: 'booking',
    entityId: booking._id,
    description: `${adminName(req)} a annule la reservation et rembourse le paiement si necessaire`,
    metadata: { paymentId: result.payment?._id },
  });
  res.json(result.booking);
});

const completeAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  if (booking.status !== 'confirmed') {
    res.status(400);
    throw new Error('La reservation doit etre confirmee avant cloture');
  }
  booking.status = 'completed';
  await booking.save();
  res.json(booking);
});

const getReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('author', 'firstName lastName')
      .populate('boat', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, page, limit, total));
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Avis introuvable');
  }
  review.status = 'approved';
  await review.save();
  await recalculateBoatRating(review.boat);
  await logAdminAction({
    admin: req.user._id,
    action: 'approve_review',
    entityType: 'review',
    entityId: review._id,
    description: `${adminName(req)} a approuve un avis`,
  });
  res.json(review);
});

const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Avis introuvable');
  }
  review.status = 'hidden';
  await review.save();
  await recalculateBoatRating(review.boat);
  await logAdminAction({
    admin: req.user._id,
    action: 'hide_review',
    entityType: 'review',
    entityId: review._id,
    description: `${adminName(req)} a masque un avis`,
  });
  res.json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Avis introuvable');
  }
  const boatId = review.boat;
  await review.deleteOne();
  await recalculateBoatRating(boatId);
  await logAdminAction({
    admin: req.user._id,
    action: 'delete_review',
    entityType: 'review',
    entityId: req.params.id,
    description: `${adminName(req)} a supprime un avis`,
  });
  res.json({ message: 'Avis supprime' });
});

const getAdminPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.paymentStatus) filter.status = req.query.paymentStatus;
  const bookingFilter = req.query.bookingStatus ? { status: req.query.bookingStatus } : {};

  const query = Payment.find(filter)
    .populate({
      path: 'booking',
      select: 'status paymentStatus startDate endDate',
      match: bookingFilter,
      populate: { path: 'boat', select: 'title' },
    })
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email')
    .sort({ createdAt: -1 });

  const allPayments = await query;
  const filtered = req.query.bookingStatus ? allPayments.filter((payment) => payment.booking) : allPayments;
  const items = filtered.slice(skip, skip + limit);

  const [paid, fees, pending, refunded] = await Promise.all([
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$serviceFee' } } }]),
    Payment.countDocuments({ status: 'requires_capture' }),
    Payment.aggregate([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.json({
    ...paginatedResponse(items, page, limit, filtered.length),
    summary: {
      totalPaidRevenue: paid[0]?.total || 0,
      totalServiceFees: fees[0]?.total || 0,
      pendingPayments: pending,
      refundedAmount: refunded[0]?.total || 0,
    },
  });
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Paiement introuvable');
  }
  if (payment.status !== 'succeeded') {
    res.status(400);
    throw new Error('Seul un paiement reussi peut etre rembourse');
  }
  const booking = await Booking.findById(payment.booking);
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  await refundBookingPayment({ booking, adminId: req.user._id });
  await logAdminAction({
    admin: req.user._id,
    action: 'refund_payment',
    entityType: 'payment',
    entityId: payment._id,
    description: `${adminName(req)} a rembourse le paiement ${payment.providerReference}`,
  });
  res.json(await Payment.findById(payment._id).populate('booking', 'status paymentStatus'));
});

const getActionLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.entityType) filter.entityType = req.query.entityType;
  const [items, total] = await Promise.all([
    AdminActionLog.find(filter)
      .populate('admin', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AdminActionLog.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, page, limit, total));
});

module.exports = {
  getStats,
  getUsers,
  updateUser,
  disableUser,
  getAdminBoats,
  approveBoat,
  rejectBoat,
  deleteBoat,
  getAdminBookings,
  cancelAdminBooking,
  completeAdminBooking,
  getReviews,
  approveReview,
  hideReview,
  deleteReview,
  getAdminPayments,
  refundPayment,
  getActionLogs,
};
