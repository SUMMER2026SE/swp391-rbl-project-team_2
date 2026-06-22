const { Sequelize } = require('sequelize');
const moment = require('moment');
require('dotenv').config();

// Removed custom _stringify to ensure dates are correctly stored as UTC in DB

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: true, // Always use UTC for reliable date handling
        dateFirst: 1, // Set first day of week to Monday to align with ymd format defaults
        language: 'us_english' // Force US English language for the SQL Server connection to avoid date parsing errors
      },
    },
    timezone: '+00:00', // Set timezone to UTC for consistent parsing
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
