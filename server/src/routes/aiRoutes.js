const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const jwt = require('jsonwebtoken');

// Optional authentication middleware to capture user info if logged in
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        roleId: decoded.roleId,
        email: decoded.email,
        roleName: decoded.roleName,
      };
    } catch (e) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

// Define routes with optional authentication
router.post('/search', optionalAuth, aiController.processSearch);
router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;
