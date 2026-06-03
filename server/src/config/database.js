const { Sequelize } = require('sequelize');
require('dotenv').config();

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
        useUTC: false, // Use local time instead of UTC
        dateFirst: 1, // Set first day of week to Monday to align with ymd format defaults
        language: 'us_english' // Force US English language for the SQL Server connection to avoid date parsing errors
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+07:00', // Vietnam timezone
  }
);

module.exports = sequelize;
