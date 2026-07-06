const Booking = require('../models/Booking');

const ACTIVE_BOOKING_STATUSES = ['pending', 'accepted', 'confirmed'];

const toDateOnly = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const rangesOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB;

const hasUnavailableDateConflict = (boat, startDate, endDate) => {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);

  return (boat.unavailableDates || []).some((date) => {
    const unavailable = toDateOnly(date);
    return unavailable >= start && unavailable < end;
  });
};

const findConflictingBooking = async (boatId, startDate, endDate, excludedBookingId = null) => {
  const filter = {
    boat: boatId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludedBookingId) filter._id = { $ne: excludedBookingId };

  return Booking.findOne(filter);
};

const assertBoatAvailable = async ({ boat, startDate, endDate, excludedBookingId = null }) => {
  if (hasUnavailableDateConflict(boat, startDate, endDate)) {
    const error = new Error('Boat is unavailable for the selected dates');
    error.statusCode = 409;
    throw error;
  }

  const conflictingBooking = await findConflictingBooking(boat._id, startDate, endDate, excludedBookingId);
  if (conflictingBooking) {
    const error = new Error('Boat already has a booking for the selected dates');
    error.statusCode = 409;
    throw error;
  }
};

module.exports = {
  ACTIVE_BOOKING_STATUSES,
  assertBoatAvailable,
  findConflictingBooking,
  hasUnavailableDateConflict,
  rangesOverlap,
};
