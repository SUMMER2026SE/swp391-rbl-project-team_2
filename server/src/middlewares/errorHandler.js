const errorHandler = (err, req, res, next) => {
  console.error('❌ ========== ERROR HANDLER ==========');
  console.error('❌ Error Message:', err.message);
  console.error('❌ Error Name:', err.name);
  console.error('❌ Error Code:', err.code);
  console.error('❌ Status Code:', err.statusCode || 500);
  console.error('❌ Stack Trace:', err.stack);
  console.error('❌ Full Error Object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  console.error('❌ Request URL:', req.originalUrl);
  console.error('❌ Request Method:', req.method);
  console.error('❌ Request User:', req.user);
  console.error('❌ ====================================');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    }),
  });
};

module.exports = errorHandler;
