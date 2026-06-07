const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

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
// CONVERSATION MANAGEMENT
// =========================================================
router.put('/conversations/:conversationId/close', messageController.closeConversation);

module.exports = router;
