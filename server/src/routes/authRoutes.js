const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, exportMyData, anonymizeMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { registerRules, loginRules } = require('../middleware/validators');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/me/export', protect, exportMyData);
router.delete('/me/anonymize', protect, anonymizeMe);

module.exports = router;
