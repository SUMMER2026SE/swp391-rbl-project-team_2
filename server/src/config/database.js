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
    hooks: {
      afterConnect: async (connection) => {
        // Force SQL Server to use Year-Month-Day format and US English for this connection
        // This prevents "Conversion failed when converting date and/or time from character string"
        const request = new connection.Request();
        await request.query("SET DATEFORMAT ymd; SET LANGUAGE us_english;");
      }
    }
  }
);

module.exports = sequelize;
