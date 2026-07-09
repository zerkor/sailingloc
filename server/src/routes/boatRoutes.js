const express = require('express');
const router = express.Router();
const {
  getBoats,
  getBoatById,
  getBoatBySlug,
  createBoat,
  updateBoat,
  deleteBoat,
  getOwnerBoats,
} = require('../controllers/boatController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { mongoId, pagination, boatRules, updateBoatRules } = require('../middleware/validators');

router.get('/', pagination, validate, getBoats);
router.get('/owner/my-boats', protect, requireRole('owner', 'admin'), getOwnerBoats);
router.get('/slug/:slug', optionalProtect, getBoatBySlug);
router.get('/:id', optionalProtect, mongoId(), validate, getBoatById);
router.post('/', protect, requireRole('owner', 'admin'), boatRules, validate, createBoat);
router.put('/:id', protect, requireRole('owner', 'admin'), mongoId(), updateBoatRules, validate, updateBoat);
router.delete('/:id', protect, requireRole('owner', 'admin'), mongoId(), validate, deleteBoat);

module.exports = router;
