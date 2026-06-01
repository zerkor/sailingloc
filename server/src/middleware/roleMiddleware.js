const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Access forbidden: insufficient role');
  }
  next();
};

module.exports = { requireRole };
