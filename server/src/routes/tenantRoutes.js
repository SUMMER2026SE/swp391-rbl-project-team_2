const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const isTenant = require('../middlewares/isTenant');

// Controllers
const favoriteController = require('../controllers/favoriteController');
const tenantRentalRequestController = require('../controllers/tenantRentalRequestController');
const paymentController = require('../controllers/paymentController');
const viewingScheduleController = require('../controllers/viewingScheduleController');

// =========================================================
// MIDDLEWARE
// =========================================================
router.use(authMiddleware);
router.use(isTenant);

// =========================================================
// FAVORITE ROUTES
// =========================================================
router.post('/favorites/:roomId', favoriteController.addFavorite);
router.delete('/favorites/:roomId', favoriteController.removeFavorite);
router.get('/favorites', favoriteController.getMyFavorites);

// =========================================================
// RENTAL REQUEST ROUTES (Tenant-side)
// =========================================================
router.post('/rental-requests', tenantRentalRequestController.createRentalRequest);
router.get('/rental-requests', tenantRentalRequestController.getMyRentalRequests);
router.get('/rental-requests/:requestId', tenantRentalRequestController.getRentalRequestDetail);
router.put('/rental-requests/:requestId/cancel', tenantRentalRequestController.cancelRentalRequest);

// =========================================================
// PAYMENT ROUTES (Tenant-side)
// =========================================================
router.post('/payments/create_payment_url', paymentController.createPaymentUrl);
router.get('/payments/vnpay_return', paymentController.vnpayReturn);
router.get('/payments', paymentController.getMyPayments);
router.put('/payments/:id/cancel', paymentController.cancelPayment);

// =========================================================
// VIEWING SCHEDULE ROUTES (Tenant-side)
// =========================================================
router.post('/viewing-schedules', viewingScheduleController.requestViewing);
router.post('/viewing-schedules/:scheduleId/pay', viewingScheduleController.retryPayment);
router.post('/viewing-schedules/:scheduleId/request-contract', viewingScheduleController.requestContract);
router.post('/viewing-schedules/:scheduleId/dispute', viewingScheduleController.disputeViewingSchedule);
router.get('/viewing-schedules', viewingScheduleController.getTenantViewingSchedules);

// =========================================================
// CONTRACT ROUTES (Tenant-side)
// =========================================================
router.get('/contracts', viewingScheduleController.getTenantContracts);
router.put('/contracts/:contractId/sign', viewingScheduleController.signContract);

module.exports = router;
