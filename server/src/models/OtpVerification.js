const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpVerification = sequelize.define('OtpVerification', {
  otp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING(30),
    allowNull: false, // 'verify_email' or 'forgot_password'
  },
  expired_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'otp_verifications',
  timestamps: false,
});

module.exports = OtpVerification;
