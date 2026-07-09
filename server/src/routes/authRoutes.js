const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  exportMyData,
  anonymizeMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validators');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/me/export', protect, exportMyData);
router.delete('/me/anonymize', protect, anonymizeMe);

module.exports = router;
