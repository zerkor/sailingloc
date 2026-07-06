const AdminActionLog = require('../models/AdminActionLog');

const logAdminAction = async ({ admin, action, entityType, entityId, description, metadata = {} }) => {
  if (!admin) return null;
  return AdminActionLog.create({
    admin,
    action,
    entityType,
    entityId: String(entityId),
    description,
    metadata,
  });
};

module.exports = logAdminAction;
