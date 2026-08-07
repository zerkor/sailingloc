const express = require('express');
const router = express.Router();
const {
  getMyPayments,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/me', protect, getMyPayments);
router.post('/stripe/create-checkout-session', protect, requireRole('tenant'), createStripeCheckoutSession);
router.post('/stripe/confirm-session', protect, requireRole('tenant'), confirmStripeCheckoutSession);

module.exports = router;
