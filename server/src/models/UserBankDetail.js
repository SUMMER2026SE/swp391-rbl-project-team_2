const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBankDetail = sequelize.define('UserBankDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  bank_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  account_holder_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_bank_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserBankDetail;
