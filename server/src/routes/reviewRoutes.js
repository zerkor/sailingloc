const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createReviewRules } = require('../middleware/validators');

router.post('/', protect, requireRole('tenant'), createReviewRules, validate, createReview);

module.exports = router;
