const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

router.get('/disputes', adminController.getAllDisputes);
router.post('/disputes/:scheduleId/resolve', adminController.resolveDispute);

module.exports = router;
