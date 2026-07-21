const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const { chatStorage } = require('../config/cloudinary');

// Multer config for chat uploads
const upload = multer({
  storage: chatStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Reuse existing message controller
const messageController = require('../controllers/messageController');

// =========================================================
// MIDDLEWARE
// =========================================================
router.use(authMiddleware);

// =========================================================
// CONVERSATION ROUTES
// =========================================================
router.post('/conversations', messageController.createOrGetConversation);
router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId', messageController.getConversationDetails);

// =========================================================
// MESSAGE ROUTES
// =========================================================
router.post('/conversations/:conversationId/messages', messageController.sendMessage);
router.get('/conversations/:conversationId/messages', messageController.getConversationMessages);

// =========================================================
// ATTACHMENT ROUTES
// =========================================================
router.post('/upload', upload.single('file'), messageController.uploadChatAttachment);

// =========================================================
// CONVERSATION MANAGEMENT
// =========================================================
router.put('/conversations/:conversationId/close', messageController.closeConversation);

module.exports = router;
