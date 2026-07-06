const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { updateProfileRules } = require('../middleware/validators');

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfileRules, validate, updateProfile);
router.delete('/me', protect, deleteAccount);

module.exports = router;
