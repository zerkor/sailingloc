const express = require('express');
const { createContactMessage } = require('../controllers/contactController');
const { validate } = require('../middleware/validateMiddleware');
const { contactMessageRules } = require('../middleware/validators');

const router = express.Router();

router.post('/', contactMessageRules, validate, createContactMessage);

module.exports = router;
