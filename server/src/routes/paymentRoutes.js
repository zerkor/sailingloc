const express = require('express');
const router = express.Router();
const { getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyPayments);

module.exports = router;
