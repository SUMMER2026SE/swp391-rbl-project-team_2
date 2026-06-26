const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const roomController = require('../controllers/roomController');
const roomImageController = require('../controllers/roomImageController');
const facilityController = require('../controllers/facilityController');
const rentalRequestController = require('../controllers/rentalRequestController');
const paymentController = require('../controllers/paymentController');
const contractController = require('../controllers/contractController');
const viewingScheduleController = require('../controllers/viewingScheduleController');
const complaintController = require('../controllers/complaintController');
const messageController = require('../controllers/messageController');
const notificationController = require('../controllers/notificationController');
const dashboardController = require('../controllers/dashboardController');
const landlordProfileController = require('../controllers/landlordProfileController');

// =========================================================
// MULTER CONFIGURATION
// =========================================================
const { storage } = require('../config/cloudinary');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// =========================================================
// MIDDLEWARE
// =========================================================
router.use(authMiddleware);

// =========================================================
// PROFILE ROUTES
// =========================================================
router.get('/profile', landlordProfileController.getLandlordProfile);
router.put('/profile', landlordProfileController.updateLandlordProfile);
router.put('/profile/avatar', upload.single('avatar'), landlordProfileController.updateAvatar);
router.post('/profile/avatar', upload.single('file'), landlordProfileController.updateAvatar);
router.put('/profile/password', landlordProfileController.changePassword);
router.post('/profile/change-password', landlordProfileController.changePassword);

// =========================================================
// DASHBOARD ROUTES
// =========================================================
router.get('/stats', dashboardController.getDashboardStatistics);
router.get('/dashboard/statistics', dashboardController.getDashboardStatistics);
router.get('/dashboard/recent-activity', dashboardController.getRecentActivity);
router.get('/dashboard/revenue-chart', dashboardController.getRevenueChart);
router.get('/dashboard/room-status', dashboardController.getRoomStatusDistribution);

// =========================================================
// ROOM ROUTES
// =========================================================
router.post('/rooms', upload.single('image'), roomController.createRoom);
router.get('/rooms', roomController.getLandlordRooms);
router.get('/rooms/:roomId', roomController.getRoomDetails);
router.put('/rooms/:roomId', upload.single('image'), roomController.updateRoom);
router.delete('/rooms/:roomId', roomController.deleteRoom);
router.put('/rooms/:roomId/status', roomController.updateRoomStatus);

// =========================================================
// ROOM IMAGE ROUTES
// =========================================================
router.post('/rooms/:roomId/images', upload.single('image'), roomImageController.uploadRoomImage);
router.get('/rooms/:roomId/images', roomImageController.getRoomImages);
router.delete('/rooms/:roomId/images/:imageId', roomImageController.deleteRoomImage);
router.put('/rooms/:roomId/images/:imageId/primary', roomImageController.setPrimaryImage);

// =========================================================
// FACILITY ROUTES
// =========================================================
router.post('/rooms/:roomId/facilities', facilityController.addFacility);
router.get('/rooms/:roomId/facilities', facilityController.getRoomFacilities);
router.put('/rooms/:roomId/facilities/:facilityId', facilityController.updateFacility);
router.delete('/rooms/:roomId/facilities/:facilityId', facilityController.removeFacility);

// =========================================================
// RENTAL REQUEST ROUTES
// =========================================================
router.get('/rental-requests', rentalRequestController.getLandlordRentalRequests);
router.get('/rental-requests/:requestId', rentalRequestController.getRentalRequestDetails);
router.put('/rental-requests/:requestId/approve', rentalRequestController.approveRentalRequest);
router.put('/rental-requests/:requestId/reject', rentalRequestController.rejectRentalRequest);
router.post('/rental-requests/:requestId/create-contract', rentalRequestController.createContractFromRequest);

// =========================================================
// PAYMENT ROUTES
// =========================================================
router.get('/payments', paymentController.getLandlordPayments);
router.get('/payments/:paymentId', paymentController.getPaymentDetails);
router.get('/payments/history/:contractId', paymentController.getContractPaymentHistory);
router.get('/payments/statistics', paymentController.getPaymentStatistics);

// =========================================================
// CONTRACT ROUTES
// =========================================================
router.post('/contracts', contractController.createContract);
router.get('/contracts', contractController.getLandlordContracts);
router.get('/contracts/:contractId', contractController.getContractDetails);
router.put('/contracts/:contractId', contractController.updateContract);
router.post('/contracts/:contractId/renew', contractController.renewContract);
router.put('/contracts/:contractId/terminate', contractController.terminateContract);

// =========================================================
// VIEWING SCHEDULE ROUTES
// =========================================================
router.post('/viewing-schedules', viewingScheduleController.createViewingSchedule);
router.get('/viewing-schedules', viewingScheduleController.getLandlordViewingSchedules);
router.get('/viewing-schedules/:scheduleId', viewingScheduleController.getViewingScheduleDetails);
router.put('/viewing-schedules/:scheduleId', viewingScheduleController.updateViewingSchedule);
router.put('/viewing-schedules/:scheduleId/confirm-viewing', viewingScheduleController.confirmViewing);
router.put('/viewing-schedules/:scheduleId/no-show', viewingScheduleController.markNoShow);
router.post('/viewing-schedules/:scheduleId/create-contract', viewingScheduleController.createContractFromViewing);
router.delete('/viewing-schedules/:scheduleId', viewingScheduleController.deleteViewingSchedule);

router.post('/schedules', viewingScheduleController.createViewingSchedule);
router.get('/schedules', viewingScheduleController.getLandlordViewingSchedules);
router.get('/schedules/:scheduleId', viewingScheduleController.getViewingScheduleDetails);
router.put('/schedules/:scheduleId', viewingScheduleController.updateViewingSchedule);
router.put('/schedules/:scheduleId/confirm-viewing', viewingScheduleController.confirmViewing);
router.put('/schedules/:scheduleId/no-show', viewingScheduleController.markNoShow);
router.post('/schedules/:scheduleId/create-contract', viewingScheduleController.createContractFromViewing);
router.delete('/schedules/:scheduleId', viewingScheduleController.deleteViewingSchedule);

// =========================================================
// COMPLAINT ROUTES
// =========================================================
router.get('/complaints', complaintController.getLandlordComplaints);
router.get('/complaints/:complaintId', complaintController.getComplaintDetails);
router.put('/complaints/:complaintId/status', complaintController.updateComplaintStatus);
router.put('/complaints/:complaintId/priority', complaintController.updateComplaintPriority);

// =========================================================
// MESSAGE/CONVERSATION ROUTES
// =========================================================
router.post('/conversations', messageController.createOrGetConversation);
router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId', messageController.getConversationDetails);
router.get('/conversations/:conversationId/messages', messageController.getConversationMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);
router.put('/conversations/:conversationId/close', messageController.closeConversation);

// =========================================================
// NOTIFICATION ROUTES
// =========================================================
router.get('/notifications', notificationController.getUserNotifications);
router.get('/notifications/unread/count', notificationController.getUnreadNotificationCount);
router.put('/notifications/:notificationId/read', notificationController.markNotificationAsRead);
router.put('/notifications/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);
router.delete('/notifications/delete-all', notificationController.deleteAllNotifications);

module.exports = router;
