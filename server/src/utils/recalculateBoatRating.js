const Boat = require('../models/Boat');
const Review = require('../models/Review');

const recalculateBoatRating = async (boatId) => {
  const approvedReviews = await Review.find({ boat: boatId, status: 'approved' }).select('rating');

  const averageRating = approvedReviews.length
    ? Math.round((approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length) * 10) / 10
    : 0;

  await Boat.findByIdAndUpdate(boatId, { averageRating });
  return averageRating;
};

module.exports = recalculateBoatRating;
