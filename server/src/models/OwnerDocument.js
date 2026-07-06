const mongoose = require('mongoose');

const ownerDocumentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat' },
    type: {
      type: String,
      enum: ['identity', 'insurance', 'registration', 'contract', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

ownerDocumentSchema.index({ owner: 1, createdAt: -1 });
ownerDocumentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('OwnerDocument', ownerDocumentSchema);
