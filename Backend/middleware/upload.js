const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';
const photoDir = path.join(uploadDir, 'photos');
const docDir = path.join(uploadDir, 'documents');

// Ensure base and subdirectories exist
[uploadDir, photoDir, docDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
    const isPDF = ext === '.pdf';

    if (isImage) {
      cb(null, photoDir);
    } else if (isPDF) {
      cb(null, docDir);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG/JPG/PNG) and PDFs are allowed'));
  }
};

module.exports = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});
