const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  notification_type: {
    type: DataTypes.ENUM(
      'rental_request',
      'payment',
      'complaint',
      'message',
      'viewing_schedule',
      'contract',
      'system'
    ),
    defaultValue: 'system',
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['is_read'],
    },
  ],
});

module.exports = Notification;
