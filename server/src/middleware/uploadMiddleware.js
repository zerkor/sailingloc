const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);

const ensureDirectory = (folder) => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
};

const sanitizeName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const typeFolder = req.uploadType === 'document' ? 'documents' : 'boat-images';
    const target = path.join(uploadRoot, typeFolder);
    ensureDirectory(target);
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const parsed = path.parse(file.originalname);
    const ext = parsed.ext.toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeName(parsed.name)}${ext}`);
  },
});

const allowedMimeTypes = {
  boatImage: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'image/jpeg', 'image/png'],
};

const fileFilter = (req, file, cb) => {
  const allowed = req.uploadType === 'document' ? allowedMimeTypes.document : allowedMimeTypes.boatImage;
  if (!allowed.includes(file.mimetype)) {
    cb(new Error('Type de fichier non supporté'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
});

const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};

module.exports = { upload, setUploadType, uploadRoot };
