const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');
const isLandlord = require('../middlewares/isLandlord');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'listing-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// PUBLIC ROUTES (No Token Required)
// GET /api/listings -> get all active public rooms
router.get('/', roomController.getAllPublicRooms);

// GET /api/listings/:roomId -> get single public room details
router.get('/:roomId', roomController.getPublicRoomDetails);

// =========================================================
// SECURE ROUTES
// =========================================================
const verifyToken = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.verifyToken || authMiddleware;
router.use(verifyToken);
router.use(isLandlord);

// GET /api/listings/landlord -> get rooms (Landlord specific)
router.get('/landlord', roomController.getLandlordRooms);

// POST /api/listings -> create room (with image upload)
router.post('/', upload.single('image'), roomController.createRoom);

// PUT /api/listings/:roomId -> update room
router.put('/:roomId', upload.single('image'), roomController.updateRoom);

// DELETE /api/listings/:roomId -> delete room
router.delete('/:roomId', roomController.deleteRoom);

module.exports = router;
