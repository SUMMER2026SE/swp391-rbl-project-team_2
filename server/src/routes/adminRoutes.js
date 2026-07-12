const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const adminController = require('../controllers/adminController');
const withdrawalController = require('../controllers/withdrawalController');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(isAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/revenue-chart', adminController.getRevenueChart);
router.get('/dashboard/recent-activities', adminController.getRecentActivities);

// Listings (Rooms)
router.get('/rooms', adminController.getAllRooms);
router.put('/rooms/:id/status', adminController.updateRoomStatus);

// Transactions, Complaints, Payouts
router.get('/transactions', adminController.getAllTransactions);
router.get('/complaints', adminController.getAllComplaints);

router.get('/payouts', adminController.getPayouts);
router.put('/payouts/:id/process', adminController.processPayout);

// Admin Withdrawal Request Management
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/withdrawals/upload-proof', upload.single('proof'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  return res.status(200).json({ success: true, url: req.file.path });
});

router.get('/withdrawals', withdrawalController.getAdminWithdrawals);
router.put('/withdrawals/:id/process', withdrawalController.processWithdrawal);
router.put('/withdrawals/:id/complete', withdrawalController.completeWithdrawal);
router.put('/withdrawals/:id/reject', withdrawalController.rejectWithdrawal);
router.get('/finance/statistics', withdrawalController.getAdminFinanceStats);

router.get('/disputes', adminController.getAllDisputes);
router.post('/disputes/:scheduleId/resolve', adminController.resolveDispute);

module.exports = router;
