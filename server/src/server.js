const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');
const initDatabase = require('./config/initDatabase');
const initSocket = require('./config/socket');
const initCronJobs = require('./cron/refundJobs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);
app.set('io', io); // make io accessible in controllers via req.app.get('io')

const PORT = process.env.PORT || 5000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });

// Function to log to both console and file
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

// =========================================================
// MIDDLEWARES
// =========================================================
app.use((req, res, next) => {
  const message = `📨 [${new Date().toISOString()}] ${req.method} ${req.path}`;
  console.log(message);
  logStream.write(message + '\n');
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =========================================================
// ROUTES
// =========================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Smart Rental Room System API is running!',
    version: '1.0.0',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Smart Rental Room System API is running!',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/rooms', listingRoutes);  // Alias: /api/rooms -> same as /api/listings
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// =========================================================
// ERROR HANDLER
// =========================================================
app.use(errorHandler);

// =========================================================
// START SERVER
// =========================================================
const startServer = async () => {
  try {
    // Initialize database with proper table creation order
    await initDatabase();

    // Initialize Cron Jobs
    initCronJobs();

    // Test database connection
    await sequelize.authenticate();
    log('✅ Database connected successfully!');

    server.listen(PORT, () => {
      log(`🚀 Server running on http://localhost:${PORT}`);
      log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    log('❌ Unable to connect to the database: ' + error.message);
    log(error.stack);
    process.exit(1);
  }
};

startServer();
