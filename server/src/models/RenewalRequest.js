const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RenewalRequest = sequelize.define('RenewalRequest', {
  id: {
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
  requested_duration_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  proposed_new_rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  additional_terms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  landlord_signed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tenant_signed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PENDING_INTENT', // PENDING_INTENT, PENDING_LANDLORD, WAITING_TENANT_SIGN, COMPLETED, REJECTED, EXPIRED
    allowNull: false,
  },
  new_contract_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  deadline_to_sign: {
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
  tableName: 'contract_renewal_requests',
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
      fields: ['status'],
    },
  ],
});

module.exports = RenewalRequest;
