const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contract_id: {
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
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_type: {
    type: DataTypes.ENUM('rent', 'deposit', 'utility', 'maintenance', 'other'),
    defaultValue: 'rent',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'credit_card', 'e_wallet'),
    allowNull: true,
  },
  transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  platform_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  net_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  payout_status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed'),
    defaultValue: 'pending',
  },
  payout_date: {
    type: DataTypes.DATE,
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
  tableName: 'payments',
  timestamps: false,
  indexes: [
    {
      fields: ['contract_id'],
    },
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['landlord_id'],
    },
    {
      fields: ['room_id'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = Payment;
