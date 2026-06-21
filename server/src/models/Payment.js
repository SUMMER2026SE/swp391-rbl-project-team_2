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
    allowNull: true,
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
  viewing_schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'rent',
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'credit_card', 'e_wallet', 'vnpay'),
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
  refund_amount: {
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
