const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  listing_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined,
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined,
  },
  type: {
    type: DataTypes.ENUM('view', 'rent', 'view_request', 'deposit'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
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
  tableName: 'bookings',
  timestamps: false,
});

module.exports = Booking;
