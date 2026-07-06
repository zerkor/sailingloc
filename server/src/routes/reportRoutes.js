const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { mongoId } = require('../middleware/validators');
const { validate } = require('../middleware/validateMiddleware');
const { createReport, getAdminReports, updateReportStatus } = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/admin', protect, requireRole('admin'), getAdminReports);
router.patch('/admin/:id/status', protect, requireRole('admin'), mongoId(), validate, updateReportStatus);

module.exports = router;
