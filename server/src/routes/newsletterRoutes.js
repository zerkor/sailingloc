const express = require('express');
const { subscribeNewsletter } = require('../controllers/newsletterController');
const { validate } = require('../middleware/validateMiddleware');
const { publicNewsletterRules } = require('../middleware/validators');

const router = express.Router();

router.post('/subscribe', publicNewsletterRules, validate, subscribeNewsletter);

module.exports = router;
