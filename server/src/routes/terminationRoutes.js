const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authMiddleware = require('../middlewares/authMiddleware');
const terminationController = require('../controllers/terminationController');

// Configure upload storage (Cloudinary or local fallback)
let storage;
try {
  const cloudinaryConfig = require('../config/cloudinary');
  storage = cloudinaryConfig.evidenceStorage || cloudinaryConfig.chatStorage || cloudinaryConfig.storage;
} catch (e) {
  // Local storage fallback
  const uploadDir = path.join(__dirname, '../../uploads/termination');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max per file for photos/videos/docs
});

// Protected routes (requires logged in user)
router.use(authMiddleware);

// POST /api/termination/request - Submit request with files
router.post('/request', upload.array('evidenceFiles', 10), terminationController.createRequest);

// GET /api/termination/history - Get user's request history
router.get('/history', terminationController.getHistory);

// GET /api/termination/contract/:contractId - Get status for a specific contract
router.get('/contract/:contractId', terminationController.getByContractId);

// GET /api/termination/request/:id - Get request details
router.get('/request/:id', terminationController.getRequestDetail);

// PUT /api/termination/request/:id/approve - Approve request
router.put('/request/:id/approve', terminationController.approveRequest);

// PUT /api/termination/request/:id/reject - Reject request
router.put('/request/:id/reject', terminationController.rejectRequest);

// POST /api/termination/request/:id/dispute - Raise dispute
router.post('/request/:id/dispute', terminationController.disputeRequest);

// POST /api/termination/request/:id/refund/upload - Upload refund proof
router.post('/request/:id/refund/upload', upload.single('refundProof'), terminationController.uploadRefundProof);

// POST /api/termination/request/:id/refund/confirm - Confirm refund receipt
router.post('/request/:id/refund/confirm', terminationController.confirmRefundReceipt);

module.exports = router;
