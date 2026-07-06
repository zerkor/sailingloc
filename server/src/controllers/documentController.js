const asyncHandler = require('../utils/asyncHandler');
const OwnerDocument = require('../models/OwnerDocument');
const Boat = require('../models/Boat');
const createNotification = require('../utils/createNotification');
const logAdminAction = require('../utils/adminActionLog');
const { parsePagination, paginatedResponse } = require('../utils/paginate');

const createDocument = asyncHandler(async (req, res) => {
  const { boatId, type, title, fileUrl } = req.body;
  if (boatId) {
    const boat = await Boat.findOne({ _id: boatId, owner: req.user._id });
    if (!boat) { res.status(404); throw new Error('Boat not found'); }
  }
  const document = await OwnerDocument.create({
    owner: req.user._id,
    boat: boatId || undefined,
    type,
    title,
    fileUrl,
  });
  await createNotification({
    user: req.user._id,
    type: 'document_submitted',
    title: 'Document envoye',
    message: 'Votre document est en attente de validation administrative.',
    relatedBoat: boatId,
  });
  res.status(201).json(document);
});

const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await OwnerDocument.find({ owner: req.user._id }).populate('boat', 'title').sort({ createdAt: -1 });
  res.json(documents);
});

const getAdminDocuments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [documents, total] = await Promise.all([
    OwnerDocument.find(filter)
      .populate('owner', 'firstName lastName email')
      .populate('boat', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OwnerDocument.countDocuments(filter),
  ]);
  res.json(paginatedResponse(documents, page, limit, total));
});

const reviewDocument = asyncHandler(async (req, res) => {
  const document = await OwnerDocument.findById(req.params.id);
  if (!document) { res.status(404); throw new Error('Document not found'); }
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid document status');
  }
  document.status = status;
  document.rejectionReason = status === 'rejected' ? rejectionReason || 'Document non conforme' : undefined;
  document.reviewedBy = req.user._id;
  document.reviewedAt = new Date();
  await document.save();
  await logAdminAction({
    admin: req.user._id,
    action: status === 'approved' ? 'approve_document' : 'reject_document',
    entityType: 'document',
    entityId: document._id,
    description: `${status === 'approved' ? 'Validation' : 'Rejet'} du document ${document.title}`,
    metadata: { rejectionReason: document.rejectionReason },
  });
  res.json(document);
});

module.exports = { createDocument, getMyDocuments, getAdminDocuments, reviewDocument };
