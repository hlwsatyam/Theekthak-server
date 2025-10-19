const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create dynamic storage with date-wise folders
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const uploadPath = `uploads/files/${year}/${month}/${day}`;
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + extension);
  }
});

// ✅ Allow all major file types (image, video, audio, pdf, doc, etc.)
const allowedMimeTypes = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',

  // Videos
  'video/mp4', 'video/mkv', 'video/avi', 'video/mov', 'video/webm',

  // Audio
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip', 'application/x-zip-compressed',
];

// ✅ File filter
const fileFilter = (req, file, cb) => {
 
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images, videos, audio, pdf, and docs.'), false);
  }
};

// ✅ Multer config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

module.exports = upload;
