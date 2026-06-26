const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contract = sequelize.define('Contract', {
  contract_id: {
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
  contract_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  monthly_rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  tenant_agreed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  terms_and_conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  document_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_renewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  landlord_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  landlord_ic: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  landlord_ic_issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  landlord_ic_issue_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  landlord_permanent_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  landlord_signature: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tenant_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tenant_ic: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  tenant_ic_issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  tenant_ic_issue_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tenant_permanent_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tenant_signature: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  renewal_contract_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'contracts',
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

module.exports = Contract;
