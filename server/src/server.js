const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================
// MIDDLEWARES
// =========================================================
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
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Smart Rental Room System API is running!',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// =========================================================
// ERROR HANDLER
// =========================================================
app.use(errorHandler);

// =========================================================
// START SERVER
// =========================================================
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

startServer();
