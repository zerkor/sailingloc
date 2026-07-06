const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) { res.status(404); throw new Error('Notification not found'); }
  notification.readAt = new Date();
  await notification.save();
  res.json(notification);
});

module.exports = { getMyNotifications, markNotificationRead };
