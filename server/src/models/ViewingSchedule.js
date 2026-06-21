const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ViewingSchedule = sequelize.define('ViewingSchedule', {
  schedule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending_payment',
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tenant_decision: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  payment_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dispute_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
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
  tableName: 'viewing_schedules',
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

module.exports = ViewingSchedule;
