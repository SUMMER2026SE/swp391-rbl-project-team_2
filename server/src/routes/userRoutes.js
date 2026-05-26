const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// =========================================================
// Multer config for avatar upload
// =========================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png, .gif and .webp formats are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// =========================================================
// Routes (All protected by authMiddleware)
// =========================================================

// GET /api/user/profile
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /api/user/profile
router.put('/profile', authMiddleware, userController.updateProfile);

// POST /api/user/avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// POST /api/user/change-password
router.post('/change-password', authMiddleware, userController.changePassword);

module.exports = router;
