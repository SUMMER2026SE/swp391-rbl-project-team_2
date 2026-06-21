const { Sequelize } = require('sequelize');
const moment = require('moment');
require('dotenv').config();

// Override Sequelize date format to be compatible with MSSQL DATETIME column
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

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
    timezone: '+07:00',
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
