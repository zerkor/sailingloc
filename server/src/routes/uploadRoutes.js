const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { setUploadType, upload } = require('../middleware/uploadMiddleware');
const { uploadSingleFile } = require('../controllers/uploadController');

const router = express.Router();

router.post(
  '/boat-images',
  protect,
  requireRole('owner', 'admin'),
  setUploadType('boatImage'),
  upload.single('file'),
  uploadSingleFile
);
router.post(
  '/documents',
  protect,
  requireRole('owner', 'admin'),
  setUploadType('document'),
  upload.single('file'),
  uploadSingleFile
);

module.exports = router;
