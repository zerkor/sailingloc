const Notification = require('../models/Notification');

const createNotification = async ({ user, type, title, message, relatedBooking, relatedBoat }) => {
  if (!user) return null;
  return Notification.create({ user, type, title, message, relatedBooking, relatedBoat });
};

module.exports = createNotification;
