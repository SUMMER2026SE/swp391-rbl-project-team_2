const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./src/config/database');

async function addRejectionReason() {
  try {
    await sequelize.query('ALTER TABLE rooms ADD rejection_reason NVARCHAR(1000) NULL');
    console.log("Column rejection_reason added to rooms table.");
  } catch (err) {
    console.error(err);
  }
}
addRejectionReason();
