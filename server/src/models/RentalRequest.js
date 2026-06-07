const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RentalRequest = sequelize.define('RentalRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined, // Remove foreign key constraint from model definition
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined, // Remove foreign key constraint from model definition
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: undefined, // Remove foreign key constraint from model definition
  },
  status: {
    type: DataTypes.STRING(15),
    defaultValue: 'pending',
  },
  requested_move_in_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lease_duration_months: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
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
  tableName: 'rental_requests',
  timestamps: false,
  indexes: [
    {
      fields: ['room_id'],
    },
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['landlord_id'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = RentalRequest;
