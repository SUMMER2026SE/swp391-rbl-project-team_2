const fs = require('fs');
const path = require('path');
const logStream = fs.createWriteStream(path.join(__dirname, '../../logs/server.log'), { flags: 'a' });

const errorHandler = (err, req, res, next) => {
  const errLog = `❌ [${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\n`;
  console.error(errLog);
  logStream.write(errLog);


  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError' && err.message === 'File too large') {
    statusCode = 413;
    message = 'File is too large. Please upload an image smaller than 5MB.';
  }

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
