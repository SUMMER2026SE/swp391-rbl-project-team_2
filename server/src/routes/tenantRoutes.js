const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const isTenant = require('../middlewares/isTenant');

// Controllers
const favoriteController = require('../controllers/favoriteController');
const tenantRentalRequestController = require('../controllers/tenantRentalRequestController');

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

module.exports = router;
