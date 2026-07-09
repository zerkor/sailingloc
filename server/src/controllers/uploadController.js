const path = require('path');
const asyncHandler = require('../utils/asyncHandler');

const normalizeUrl = (file) => {
  const folder = path.basename(path.dirname(file.path));
  return `/uploads/${folder}/${file.filename}`;
};

const uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Aucun fichier reçu');
  }

  res.status(201).json({
    url: normalizeUrl(req.file),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});

module.exports = { uploadSingleFile };
