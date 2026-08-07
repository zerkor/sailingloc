const express = require('express');
const router = express.Router();
const { getMyPayments, createStripeCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/me', protect, getMyPayments);
router.post('/stripe/create-checkout-session', protect, requireRole('tenant'), createStripeCheckoutSession);

module.exports = router;
