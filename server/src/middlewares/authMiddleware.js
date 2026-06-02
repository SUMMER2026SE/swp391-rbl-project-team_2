const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    console.log('🔐 [AUTH MIDDLEWARE] Processing request to:', req.originalUrl);
    console.log('🔐 [AUTH MIDDLEWARE] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ [AUTH MIDDLEWARE] No valid Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 [AUTH MIDDLEWARE] Token extracted, verifying...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 [AUTH MIDDLEWARE] Token verified successfully');
    console.log('🔐 [AUTH MIDDLEWARE] Decoded token:', JSON.stringify(decoded, null, 2));

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      roleId: decoded.roleId,
      email: decoded.email,
      roleName: decoded.roleName,
    };

    console.log('🔐 [AUTH MIDDLEWARE] User attached to request:', JSON.stringify(req.user, null, 2));
    next();
  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] Error:', error.message);
    console.error('❌ [AUTH MIDDLEWARE] Error name:', error.name);
    
    if (error.name === 'TokenExpiredError') {
      console.warn('⚠️ [AUTH MIDDLEWARE] Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }
    console.warn('⚠️ [AUTH MIDDLEWARE] Invalid token');
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = authMiddleware;
