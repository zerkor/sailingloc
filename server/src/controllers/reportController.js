const asyncHandler = require('../utils/asyncHandler');
const Report = require('../models/Report');
const logAdminAction = require('../utils/adminActionLog');
const { parsePagination, paginatedResponse } = require('../utils/paginate');

const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;
  if (!targetType || !targetId || !reason) {
    res.status(400);
    throw new Error('Target type, target id and reason are required');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
    description,
  });

  res.status(201).json(report);
});

const getAdminReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Report.find(filter)
      .populate('reporter', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  res.json(paginatedResponse(items, page, limit, total));
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['open', 'in_review', 'resolved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid report status');
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  report.status = status;
  report.adminNote = adminNote || report.adminNote;
  await report.save();

  await logAdminAction({
    admin: req.user._id,
    action: 'update_report_status',
    entityType: 'report',
    entityId: report._id,
    description: `Signalement passe au statut ${status}`,
    metadata: { adminNote },
  });

  res.json(report);
});

module.exports = { createReport, getAdminReports, updateReportStatus };
