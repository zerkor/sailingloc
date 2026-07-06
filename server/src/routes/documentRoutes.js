const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { createDocument, getMyDocuments, getAdminDocuments, reviewDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { mongoId } = require('../middleware/validators');

const documentRules = [
  body('boatId').optional({ checkFalsy: true }).isMongoId().withMessage('Bateau invalide'),
  body('type').isIn(['identity', 'insurance', 'registration', 'contract', 'other']).withMessage('Type de document invalide'),
  body('title').trim().notEmpty().isLength({ max: 140 }).withMessage('Titre requis'),
  body('fileUrl').isURL({ require_protocol: true }).withMessage('URL de document invalide'),
];

const reviewRules = [
  body('status').isIn(['approved', 'rejected']).withMessage('Statut invalide'),
  body('rejectionReason').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

router.post('/', protect, requireRole('owner'), documentRules, validate, createDocument);
router.get('/me', protect, requireRole('owner'), getMyDocuments);
router.get('/admin', protect, requireRole('admin'), getAdminDocuments);
router.patch('/:id/review', protect, requireRole('admin'), mongoId(), reviewRules, validate, reviewDocument);

module.exports = router;
