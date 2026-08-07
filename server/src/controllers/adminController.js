const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const OwnerDocument = require('../models/OwnerDocument');
const AdminActionLog = require('../models/AdminActionLog');
const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const recalculateBoatRating = require('../utils/recalculateBoatRating');
const logAdminAction = require('../utils/adminActionLog');
const createNotification = require('../utils/createNotification');
const { assertBoatAvailable } = require('../utils/bookingAvailability');
const { parsePagination, paginatedResponse } = require('../utils/paginate');
const { stripe, isStripeEnabled } = require('../config/stripe');
const {
  sendAdminTestEmail,
  sendBoatApprovedEmail,
  sendBoatRejectedEmail,
  sendBookingAcceptedEmail,
  sendBookingCompletedEmail,
  sendBookingRejectedEmail,
  sendNewsletterEmail,
  sendOwnerApprovedEmail,
} = require('../services/emailService');

const roleValues = ['tenant', 'owner', 'admin'];
const paidPaymentStatuses = ['paid', 'succeeded'];

const adminName = (req) => `${req.user.firstName || 'Admin'} ${req.user.lastName || ''}`.trim();

const resolveBookingOwner = async ({ booking, adminId }) => {
  const existingOwner = booking.owner || booking.boat?.owner;
  if (existingOwner?._id) return existingOwner;

  const fallbackOwner = await User.findOne({ role: 'owner', isActive: true }).select('firstName lastName email');
  if (fallbackOwner) return fallbackOwner;

  return User.findById(adminId).select('firstName lastName email');
};

const repairBookingOwner = async ({ booking, owner }) => {
  if (!owner?._id) return;

  const updates = [];
  if (!booking.owner || booking.owner.toString?.() !== owner._id.toString()) {
    booking.owner = owner._id;
    updates.push(Booking.updateOne({ _id: booking._id }, { owner: owner._id }));
  }
  if (booking.boat?._id && (!booking.boat.owner || booking.boat.owner.toString?.() !== owner._id.toString())) {
    booking.boat.owner = owner._id;
    updates.push(Boat.updateOne({ _id: booking.boat._id }, { owner: owner._id }));
  }

  if (updates.length > 0) await Promise.all(updates);
};

const resolveBoatOwner = async ({ boat, adminId }) => {
  if (boat.owner?._id) return boat.owner;

  const fallbackOwner = await User.findOne({ role: 'owner', isActive: true }).select('firstName lastName email');
  if (fallbackOwner) return fallbackOwner;

  return User.findById(adminId).select('firstName lastName email');
};

const repairBoatOwner = async ({ boat, owner }) => {
  if (!owner?._id) return;
  boat.owner = owner._id;
  await Boat.updateOne({ _id: boat._id }, { owner: owner._id });
};

const logEmailAttempt = async ({ admin, result, subject, recipient }) => {
  await logAdminAction({
    admin,
    action: result.success ? 'email_sent' : 'email_failed',
    entityType: 'Email',
    entityId: recipient,
    description: `${subject} -> ${recipient}`,
    metadata: { provider: result.provider, mode: result.mode, skipped: result.skipped, error: result.error },
  });
};

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
    newContactMessages,
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
    Payment.countDocuments({ status: { $in: paidPaymentStatuses } }),
    Payment.aggregate([{ $match: { status: { $in: paidPaymentStatuses } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: { $in: paidPaymentStatuses } } }, { $group: { _id: null, total: { $sum: '$serviceFee' } } }]),
    Payment.aggregate([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    require('../models/Report').countDocuments({ status: { $in: ['open', 'in_review'] } }),
    ContactMessage.countDocuments({ status: { $in: ['new', 'read'] } }),
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
    newContactMessages,
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

  if (updated.role === 'owner' && previous.isActive === false && updated.isActive === true) {
    const emailResult = await sendOwnerApprovedEmail(updated);
    await logEmailAttempt({
      admin: req.user._id,
      result: emailResult,
      subject: 'Votre compte propriétaire SailingLoc est validé',
      recipient: updated.email,
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
  const repaired = await Promise.all(
    items.map(async (boat) => {
      if (!boat.owner) {
        const owner = await resolveBoatOwner({ boat, adminId: req.user._id });
        if (owner?._id) {
          await repairBoatOwner({ boat, owner });
          boat.owner = owner;
        }
      }
      return boat;
    })
  );
  res.json(paginatedResponse(repaired, page, limit, total));
});

const approveBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id).populate('owner', 'firstName lastName email');
  if (!boat) {
    res.status(404);
    throw new Error('Bateau introuvable');
  }
  const effectiveOwner = await resolveBoatOwner({ boat, adminId: req.user._id });
  if (!effectiveOwner?._id) {
    res.status(400);
    throw new Error('Impossible d approuver ce bateau : aucun proprietaire disponible');
  }
  await repairBoatOwner({ boat, owner: effectiveOwner });
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
  const emailResult = await sendBoatApprovedEmail({ owner: effectiveOwner, boat });
  await logEmailAttempt({
    admin: req.user._id,
    result: emailResult,
    subject: 'Votre annonce bateau a été validée',
    recipient: effectiveOwner.email,
  });
  res.json(boat);
});

const rejectBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id).populate('owner', 'firstName lastName email');
  if (!boat) {
    res.status(404);
    throw new Error('Bateau introuvable');
  }
  const effectiveOwner = await resolveBoatOwner({ boat, adminId: req.user._id });
  if (!effectiveOwner?._id) {
    res.status(400);
    throw new Error('Impossible de rejeter ce bateau : aucun proprietaire disponible');
  }
  await repairBoatOwner({ boat, owner: effectiveOwner });
  boat.status = 'rejected';
  await boat.save();
  await logAdminAction({
    admin: req.user._id,
    action: 'reject_boat',
    entityType: 'boat',
    entityId: boat._id,
    description: `${adminName(req)} a rejete ${boat.title}`,
  });
  const emailResult = await sendBoatRejectedEmail({ owner: effectiveOwner, boat, reason: req.body?.reason });
  await logEmailAttempt({
    admin: req.user._id,
    result: emailResult,
    subject: 'Votre annonce bateau nécessite une correction',
    recipient: effectiveOwner.email,
  });
  res.json(boat);
});

const testEmail = asyncHandler(async (req, res) => {
  const result = await sendAdminTestEmail({ to: req.body.to });
  await logEmailAttempt({
    admin: req.user._id,
    result,
    subject: 'Test SMTP Brevo - SailingLoc',
    recipient: req.body.to,
  });
  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Email could not be sent. Check SMTP configuration.',
      errorCode: result.error,
    });
  }
  res.json({ success: true, provider: result.provider, mode: result.mode, skipped: result.skipped });
});

const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, title, message, includeAllTenants = true } = req.body;
  const filter = { role: 'tenant', isActive: true };
  if (!includeAllTenants) filter.marketingConsent = true;

  const users = await User.find(filter).select('firstName lastName email marketingConsent').sort({ createdAt: -1 });
  const subscribers = await NewsletterSubscriber.find({ isActive: true }).select('email').sort({ createdAt: -1 });
  const recipientsByEmail = new Map();

  users.forEach((user) => recipientsByEmail.set(user.email, user));
  subscribers.forEach((subscriber) => {
    if (!recipientsByEmail.has(subscriber.email)) {
      recipientsByEmail.set(subscriber.email, {
        firstName: 'Client',
        lastName: 'SailingLoc',
        email: subscriber.email,
        marketingConsent: true,
      });
    }
  });

  const recipients = Array.from(recipientsByEmail.values());
  if (recipients.length === 0) {
    res.status(400);
    throw new Error('Aucun client destinataire trouve pour cette newsletter');
  }

  const results = [];
  for (const user of recipients) {
    const result = await sendNewsletterEmail({ user, subject, title, message });
    results.push({ email: user.email, success: result.success, skipped: result.skipped, error: result.error });
    await logEmailAttempt({
      admin: req.user._id,
      result,
      subject,
      recipient: user.email,
    });
  }

  const sent = results.filter((item) => item.success && !item.skipped).length;
  const skipped = results.filter((item) => item.skipped).length;
  const failed = results.filter((item) => !item.success).length;

  await logAdminAction({
    admin: req.user._id,
    action: 'send_newsletter',
    entityType: 'email',
    entityId: req.user._id,
    description: `${adminName(req)} a envoye une newsletter a ${recipients.length} client(s)`,
  });

  res.json({
    success: failed === 0,
    total: recipients.length,
    sent,
    skipped,
    failed,
    results,
  });
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
      .populate({
        path: 'boat',
        select: 'title owner',
        populate: { path: 'owner', select: 'firstName lastName email' },
      })
      .populate('tenant', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  const repaired = await Promise.all(
    items.map(async (booking) => {
      if (!booking.owner || !booking.boat?.owner) {
        const owner = await resolveBookingOwner({ booking, adminId: req.user._id });
        if (owner?._id) {
          await repairBookingOwner({ booking, owner });
          booking.owner = owner;
          if (booking.boat) booking.boat.owner = owner;
        }
      }
      return booking;
    })
  );

  res.json(paginatedResponse(repaired, page, limit, total));
});

const refundBookingPayment = async ({ booking, adminId }) => {
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';

  const payment = booking.payment
    ? await Payment.findById(booking.payment)
    : await Payment.findOne({ booking: booking._id });

  if (payment && paidPaymentStatuses.includes(payment.status)) {
    if (payment.provider === 'stripe') {
      if (!isStripeEnabled() || !stripe || !payment.stripePaymentIntentId) {
        throw new Error('Remboursement Stripe impossible : paiement introuvable ou deja rembourse.');
      }
      await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
    }
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

const acceptAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'boat',
      populate: { path: 'owner', select: 'firstName lastName email' },
    })
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email');
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('La reservation doit etre en attente pour etre acceptee');
  }
  if (!booking.boat || !booking.tenant) {
    res.status(400);
    throw new Error('Reservation incomplete : bateau ou locataire introuvable');
  }
  const effectiveOwner = await resolveBookingOwner({ booking, adminId: req.user._id });
  if (!effectiveOwner?._id) {
    res.status(400);
    throw new Error('Reservation incomplete : aucun proprietaire disponible');
  }
  await repairBookingOwner({ booking, owner: effectiveOwner });

  await assertBoatAvailable({
    boat: booking.boat,
    startDate: booking.startDate,
    endDate: booking.endDate,
    excludedBookingId: booking._id,
  });

  booking.status = 'accepted';
  await booking.save();
  await createNotification({
    user: booking.tenant._id,
    type: 'booking_accepted',
    title: 'Reservation acceptee',
    message: `Votre demande pour ${booking.boat.title} a ete acceptee par l'administration.`,
    relatedBooking: booking._id,
    relatedBoat: booking.boat._id,
  });
  await sendBookingAcceptedEmail({
    tenant: booking.tenant,
    owner: effectiveOwner,
    boat: booking.boat,
    booking,
  });
  await logAdminAction({
    admin: req.user._id,
    action: 'accept_booking',
    entityType: 'booking',
    entityId: booking._id,
    description: `${adminName(req)} a accepte la reservation ${booking._id}${
      effectiveOwner?._id ? '' : ' sans proprietaire rattache'
    }`,
  });

  res.json(booking);
});

const rejectAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'boat',
      select: 'title owner',
      populate: { path: 'owner', select: 'firstName lastName email' },
    })
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email');
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('La reservation doit etre en attente pour etre refusee');
  }
  if (!booking.boat || !booking.tenant) {
    res.status(400);
    throw new Error('Reservation incomplete : bateau ou locataire introuvable');
  }
  const effectiveOwner = await resolveBookingOwner({ booking, adminId: req.user._id });
  if (!effectiveOwner?._id) {
    res.status(400);
    throw new Error('Reservation incomplete : aucun proprietaire disponible');
  }
  await repairBookingOwner({ booking, owner: effectiveOwner });

  booking.status = 'rejected';
  await booking.save();
  await createNotification({
    user: booking.tenant._id,
    type: 'booking_rejected',
    title: 'Reservation refusee',
    message: "L'administration a refuse votre demande de reservation.",
    relatedBooking: booking._id,
    relatedBoat: booking.boat._id,
  });
  await sendBookingRejectedEmail({
    tenant: booking.tenant,
    owner: effectiveOwner,
    boat: booking.boat,
    booking,
  });
  await logAdminAction({
    admin: req.user._id,
    action: 'reject_booking',
    entityType: 'booking',
    entityId: booking._id,
    description: `${adminName(req)} a refuse la reservation ${booking._id}${
      effectiveOwner?._id ? '' : ' sans proprietaire rattache'
    }`,
  });

  res.json(booking);
});

const completeAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('boat', 'title images location')
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email');
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
  if (booking.tenant && booking.boat) {
    await sendBookingCompletedEmail({
      tenant: booking.tenant,
      owner: booking.owner || {},
      boat: booking.boat,
      booking,
    });
  }
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
  if (req.query.provider) filter.provider = req.query.provider;
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

  const [paid, stripePaid, simulatedPaid, fees, pending, refunded] = await Promise.all([
    Payment.aggregate([{ $match: { status: { $in: paidPaymentStatuses } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: { $in: paidPaymentStatuses }, provider: 'stripe' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: { $in: paidPaymentStatuses }, provider: { $in: ['simulated', 'simulated-stripe'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([{ $match: { status: { $in: paidPaymentStatuses } } }, { $group: { _id: null, total: { $sum: '$serviceFee' } } }]),
    Payment.countDocuments({ status: { $in: ['unpaid', 'pending', 'requires_capture'] } }),
    Payment.aggregate([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.json({
    ...paginatedResponse(items, page, limit, filtered.length),
    summary: {
      totalPaidRevenue: paid[0]?.total || 0,
      stripePaidRevenue: stripePaid[0]?.total || 0,
      simulatedPaidRevenue: simulatedPaid[0]?.total || 0,
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
  if (!paidPaymentStatuses.includes(payment.status)) {
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
  acceptAdminBooking,
  rejectAdminBooking,
  cancelAdminBooking,
  completeAdminBooking,
  getReviews,
  approveReview,
  hideReview,
  deleteReview,
  getAdminPayments,
  refundPayment,
  getActionLogs,
  testEmail,
  sendNewsletter,
};
