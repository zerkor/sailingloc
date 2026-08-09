const express = require('express');
const router = express.Router();
const { createReview, getLatestReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createReviewRules } = require('../middleware/validators');

router.get('/latest', getLatestReviews);
router.post('/', protect, requireRole('tenant'), createReviewRules, validate, createReview);

module.exports = router;
