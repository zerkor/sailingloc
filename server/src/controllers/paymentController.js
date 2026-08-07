const asyncHandler = require('../utils/asyncHandler');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const createNotification = require('../utils/createNotification');
const { stripe, stripeConfig, isStripeEnabled } = require('../config/stripe');
const { generateInvoicePdf } = require('../services/invoiceService');
const { sendBookingConfirmedEmail, sendInvoiceEmail } = require('../services/emailService');

const paidStatuses = ['paid', 'succeeded'];

const populateBookingForPayment = (id) =>
  Booking.findById(id)
    .populate('boat', 'title images location owner')
    .populate('tenant', 'firstName lastName email')
    .populate('owner', 'firstName lastName email');

const getMyPayments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'owner' ? { owner: req.user._id } : { tenant: req.user._id };
  const payments = await Payment.find(filter).populate('booking', 'startDate endDate status').sort({ createdAt: -1 });
  res.json(payments);
});

const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  if (!isStripeEnabled() || !stripe) {
    res.status(503);
    throw new Error('Stripe payment is not configured.');
  }

  const booking = await Booking.findById(req.body.bookingId).populate('boat', 'title owner').populate('tenant', 'email');
  if (!booking) {
    res.status(404);
    throw new Error('Reservation introuvable');
  }
  if (booking.tenant._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Vous ne pouvez pas payer cette reservation');
  }
  if (booking.status !== 'accepted') {
    res.status(400);
    throw new Error('La reservation doit etre acceptee avant paiement');
  }
  if (booking.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('Cette reservation est deja payee');
  }
  if (!booking.totalPrice || booking.totalPrice <= 0) {
    res.status(400);
    throw new Error('Montant de reservation invalide');
  }

  const currency = stripeConfig.currency.toUpperCase();
  const payment = await Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      booking: booking._id,
      tenant: booking.tenant._id,
      owner: booking.owner || booking.boat.owner,
      boat: booking.boat._id,
      amount: booking.totalPrice,
      serviceFee: booking.serviceFee,
      currency,
      provider: 'stripe',
      status: 'pending',
      providerReference: `stripe_pending_${booking._id}`,
      metadata: {
        bookingId: booking._id.toString(),
        tenantId: booking.tenant._id.toString(),
        ownerId: (booking.owner || booking.boat.owner).toString(),
        boatId: booking.boat._id.toString(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: booking.tenant.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: stripeConfig.currency,
          unit_amount: Math.round(booking.totalPrice * 100),
          product_data: {
            name: `Reservation SailingLoc - ${booking.boat.title}`,
            description: `Reservation du ${new Date(booking.startDate).toLocaleDateString('fr-FR')} au ${new Date(
              booking.endDate
            ).toLocaleDateString('fr-FR')}`,
          },
        },
      },
    ],
    success_url: `${stripeConfig.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${stripeConfig.clientUrl}/payment/cancel?bookingId=${booking._id}`,
    metadata: {
      bookingId: booking._id.toString(),
      paymentId: payment._id.toString(),
      tenantId: booking.tenant._id.toString(),
      ownerId: (booking.owner || booking.boat.owner).toString(),
      boatId: booking.boat._id.toString(),
    },
  });

  payment.stripeCheckoutSessionId = session.id;
  payment.providerReference = session.id;
  payment.metadata = session.metadata;
  await payment.save();

  res.status(201).json({ checkoutUrl: session.url, sessionId: session.id });
});

const markPaymentFailed = async ({ paymentId, sessionId, paymentIntentId }) => {
  const filter = paymentId
    ? { _id: paymentId }
    : sessionId
      ? { stripeCheckoutSessionId: sessionId }
      : { stripePaymentIntentId: paymentIntentId };
  const payment = await Payment.findOne(filter);
  if (!payment || paidStatuses.includes(payment.status)) return;
  payment.status = 'failed';
  await payment.save();
};

const confirmStripePayment = async (session) => {
  const metadata = session.metadata || {};
  const payment = await Payment.findOne({
    $or: [{ _id: metadata.paymentId }, { stripeCheckoutSessionId: session.id }].filter((entry) => Object.values(entry)[0]),
  });
  if (!payment || paidStatuses.includes(payment.status)) return;

  const booking = await populateBookingForPayment(metadata.bookingId || payment.booking);
  if (!booking) return;

  const paidAmount = Number(session.amount_total || 0) / 100;
  if (paidAmount && Math.round(paidAmount * 100) !== Math.round(Number(booking.totalPrice || payment.amount) * 100)) {
    payment.status = 'failed';
    payment.metadata = { ...(payment.metadata || {}), amountMismatch: true, stripeAmount: paidAmount };
    await payment.save();
    return;
  }

  payment.status = 'paid';
  payment.provider = 'stripe';
  payment.amount = booking.totalPrice;
  payment.serviceFee = booking.serviceFee;
  payment.currency = (session.currency || stripeConfig.currency).toUpperCase();
  payment.stripeCheckoutSessionId = session.id;
  payment.stripePaymentIntentId = session.payment_intent;
  payment.stripeCustomerEmail = session.customer_details?.email || session.customer_email;
  payment.paidAt = new Date();
  payment.metadata = { ...(payment.metadata || {}), ...metadata };
  await payment.save();

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.payment = payment._id;
  await booking.save();

  await createNotification({
    user: booking.owner?._id || booking.owner,
    type: 'booking_paid',
    title: 'Paiement confirme',
    message: 'Le paiement Stripe de la reservation a ete valide.',
    relatedBooking: booking._id,
    relatedBoat: booking.boat?._id || booking.boat,
  });

  const populated = await populateBookingForPayment(booking._id);
  if (!payment.invoiceUrl) {
    const invoice = await generateInvoicePdf({ booking: populated, payment });
    payment.invoiceNumber = invoice.invoiceNumber;
    payment.invoiceUrl = invoice.invoiceUrl;
    payment.invoiceGeneratedAt = new Date();
    await payment.save();
    await sendInvoiceEmail({
      tenant: populated.tenant,
      boat: populated.boat,
      booking: populated,
      payment,
      invoicePath: invoice.filePath,
    });
  }
  await sendBookingConfirmedEmail({
    tenant: populated.tenant,
    owner: populated.owner,
    boat: populated.boat,
    booking: populated,
  });
};

const confirmStripeCheckoutSession = asyncHandler(async (req, res) => {
  if (!isStripeEnabled() || !stripe) {
    res.status(503);
    throw new Error('Stripe payment is not configured.');
  }

  const { sessionId } = req.body;
  if (!sessionId) {
    res.status(400);
    throw new Error('Session Stripe manquante');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const payment = await Payment.findOne({ stripeCheckoutSessionId: session.id });
  if (!payment) {
    res.status(404);
    throw new Error('Paiement Stripe introuvable');
  }
  if (payment.tenant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Vous ne pouvez pas confirmer ce paiement');
  }
  if (session.payment_status !== 'paid') {
    res.status(400);
    throw new Error("Le paiement Stripe n'est pas encore valide");
  }

  await confirmStripePayment(session);
  const refreshedPayment = await Payment.findById(payment._id).populate('booking', 'status paymentStatus');
  res.json({ message: 'Paiement confirme', payment: refreshedPayment, booking: refreshedPayment.booking });
});

const stripeWebhook = async (req, res) => {
  if (!isStripeEnabled() || !stripe || !stripeConfig.webhookSecret) {
    return res.status(503).json({ message: 'Stripe payment is not configured.' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], stripeConfig.webhookSecret);
  } catch (error) {
    return res.status(400).json({ message: `Webhook invalide: ${error.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await confirmStripePayment(event.data.object);
    }
    if (event.type === 'checkout.session.expired') {
      await markPaymentFailed({ paymentId: event.data.object.metadata?.paymentId, sessionId: event.data.object.id });
    }
    if (event.type === 'payment_intent.payment_failed') {
      await markPaymentFailed({ paymentIntentId: event.data.object.id });
    }
    if (event.type === 'charge.refunded') {
      const paymentIntentId = event.data.object.payment_intent;
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      if (payment && payment.status !== 'refunded') {
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();
        await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded', status: 'cancelled' });
      }
    }
  } catch (error) {
    console.error(`Stripe webhook processing failed: ${event.type}`, error.message);
    return res.status(500).json({ message: 'Erreur de traitement webhook Stripe' });
  }

  res.json({ received: true });
};

module.exports = {
  getMyPayments,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  stripeWebhook,
  confirmStripePayment,
};
