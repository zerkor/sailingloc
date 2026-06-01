const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, updateUser, disableUser,
  getAdminBoats, approveBoat, rejectBoat, deleteBoat,
  getAdminBookings, cancelAdminBooking, completeAdminBooking,
  getReviews, approveReview, hideReview, deleteReview,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.patch('/users/:id/disable', disableUser);
router.get('/boats', getAdminBoats);
router.patch('/boats/:id/approve', approveBoat);
router.patch('/boats/:id/reject', rejectBoat);
router.delete('/boats/:id', deleteBoat);
router.get('/bookings', getAdminBookings);
router.patch('/bookings/:id/cancel', cancelAdminBooking);
router.patch('/bookings/:id/complete', completeAdminBooking);
router.get('/reviews', getReviews);
router.patch('/reviews/:id/approve', approveReview);
router.patch('/reviews/:id/hide', hideReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
