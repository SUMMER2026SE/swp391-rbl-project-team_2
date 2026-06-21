const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Define routes
router.post('/search', aiController.processSearch);
router.post('/chat', aiController.chat);

module.exports = router;
