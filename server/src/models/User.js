const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true, // Null for Google login users
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ic_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  ic_issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  ic_issue_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  permanent_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  cccd_front_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  cccd_back_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  face_photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  verification_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unverified',
  },
  verification_notes: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
  ],
});

module.exports = User;
