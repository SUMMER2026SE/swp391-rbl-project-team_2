const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TerminationRecord = sequelize.define('TerminationRecord', {
  termination_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contract_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  termination_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  final_reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  deposit_refund: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  deposit_retained: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  remaining_rent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  compensation: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  total_payout_to_tenant: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  final_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refund_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'NONE', // 'NONE', 'PENDING_REFUND', 'REFUND_TRANSFERRED', 'COMPLETED'
  },
  refund_proof_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'termination_records',
  timestamps: false,
  indexes: [
    {
      fields: ['contract_id'],
    },
    {
      fields: ['request_id'],
    },
  ],
});

module.exports = TerminationRecord;
