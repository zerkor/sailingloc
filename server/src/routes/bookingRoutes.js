const express = require('express');
const router = express.Router();
const {
  createBooking,
  getTenantBookings,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  payBooking,
  completeBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { mongoId, createBookingRules } = require('../middleware/validators');

router.post('/', protect, requireRole('tenant'), createBookingRules, validate, createBooking);
router.get('/me', protect, getTenantBookings);
router.get('/owner', protect, requireRole('owner', 'admin'), getOwnerBookings);
router.patch('/:id/accept', protect, requireRole('owner', 'admin'), mongoId(), validate, acceptBooking);
router.patch('/:id/reject', protect, requireRole('owner', 'admin'), mongoId(), validate, rejectBooking);
router.patch('/:id/cancel', protect, mongoId(), validate, cancelBooking);
router.patch('/:id/pay', protect, requireRole('tenant'), mongoId(), validate, payBooking);
router.patch('/:id/complete', protect, requireRole('owner', 'admin'), mongoId(), validate, completeBooking);

module.exports = router;
