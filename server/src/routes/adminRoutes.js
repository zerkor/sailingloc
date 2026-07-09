const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { mongoId, updateUserRules } = require('../middleware/validators');

router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', mongoId(), updateUserRules, validate, updateUser);
router.patch('/users/:id/disable', mongoId(), validate, disableUser);
router.get('/boats', getAdminBoats);
router.patch('/boats/:id/approve', mongoId(), validate, approveBoat);
router.patch('/boats/:id/reject', mongoId(), validate, rejectBoat);
router.delete('/boats/:id', mongoId(), validate, deleteBoat);
router.get('/bookings', getAdminBookings);
router.patch('/bookings/:id/cancel', mongoId(), validate, cancelAdminBooking);
router.patch('/bookings/:id/complete', mongoId(), validate, completeAdminBooking);
router.get('/reviews', getReviews);
router.patch('/reviews/:id/approve', mongoId(), validate, approveReview);
router.patch('/reviews/:id/hide', mongoId(), validate, hideReview);
router.delete('/reviews/:id', mongoId(), validate, deleteReview);
router.get('/payments', getAdminPayments);
router.patch('/payments/:id/refund', mongoId(), validate, refundPayment);
router.get('/action-logs', getActionLogs);

module.exports = router;
