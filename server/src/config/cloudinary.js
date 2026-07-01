const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let storage;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'rental_rooms',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  // Local storage fallback when CLOUDINARY_URL is missing
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  storage = {
    _handleFile: function (req, file, cb) {
      diskStorage._handleFile(req, file, function (err, info) {
        if (err) return cb(err);
        // Override path to be a relative URL so frontend can load it
        info.path = '/uploads/' + info.filename;
        cb(null, info);
      });
    },
    _removeFile: function (req, file, cb) {
      diskStorage._removeFile(req, file, cb);
    }
  };
}

module.exports = {
  cloudinary,
  storage,
};
