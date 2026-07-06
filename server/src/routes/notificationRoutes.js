const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { mongoId } = require('../middleware/validators');

router.get('/me', protect, getMyNotifications);
router.patch('/:id/read', protect, mongoId(), validate, markNotificationRead);

module.exports = router;
