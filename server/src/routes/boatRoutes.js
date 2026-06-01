const express = require('express');
const router = express.Router();
const { getBoats, getBoatById, createBoat, updateBoat, deleteBoat, getOwnerBoats } = require('../controllers/boatController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', getBoats);
router.get('/owner/my-boats', protect, requireRole('owner', 'admin'), getOwnerBoats);
router.get('/:id', getBoatById);
router.post('/', protect, requireRole('owner', 'admin'), createBoat);
router.put('/:id', protect, requireRole('owner', 'admin'), updateBoat);
router.delete('/:id', protect, requireRole('owner', 'admin'), deleteBoat);

module.exports = router;
