const express = require('express');
const router = express.Router();
const { createBooking, getTenantBookings, getOwnerBookings, acceptBooking, rejectBooking, cancelBooking, payBooking, completeBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', protect, requireRole('tenant'), createBooking);
router.get('/me', protect, getTenantBookings);
router.get('/owner', protect, requireRole('owner', 'admin'), getOwnerBookings);
router.patch('/:id/accept', protect, requireRole('owner', 'admin'), acceptBooking);
router.patch('/:id/reject', protect, requireRole('owner', 'admin'), rejectBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/pay', protect, requireRole('tenant'), payBooking);
router.patch('/:id/complete', protect, requireRole('owner', 'admin'), completeBooking);

module.exports = router;
