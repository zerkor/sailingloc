const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', protect, requireRole('tenant'), createReview);

module.exports = router;
