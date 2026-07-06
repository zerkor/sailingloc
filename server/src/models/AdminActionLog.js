const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

adminActionLogSchema.index({ createdAt: -1 });
adminActionLogSchema.index({ action: 1, entityType: 1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
