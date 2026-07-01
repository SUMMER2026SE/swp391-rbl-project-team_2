const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE Rooms ALTER COLUMN room_number VARCHAR(1000) NULL;');
    console.log('Successfully altered room_number column to VARCHAR(1000)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
