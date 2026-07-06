const asyncHandler = require('../utils/asyncHandler');
const Payment = require('../models/Payment');

const getMyPayments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'owner'
    ? { owner: req.user._id }
    : { tenant: req.user._id };
  const payments = await Payment.find(filter)
    .populate('booking', 'startDate endDate status')
    .sort({ createdAt: -1 });
  res.json(payments);
});

module.exports = { getMyPayments };
