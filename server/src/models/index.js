const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const OtpVerification = require('./OtpVerification');

// =========================================================
// ASSOCIATIONS
// =========================================================

// Role <-> User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// User <-> OtpVerification
User.hasMany(OtpVerification, { foreignKey: 'user_id', as: 'otps' });
OtpVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Role,
  User,
  OtpVerification,
};
