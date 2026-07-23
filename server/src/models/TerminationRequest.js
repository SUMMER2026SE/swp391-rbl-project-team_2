const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TerminationRequest = sequelize.define('TerminationRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contract_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  termination_type: {
    type: DataTypes.STRING(50), // Using STRING to avoid SQL Server ENUM CHECK constraint issues
    allowNull: false,
    validate: {
      isIn: [['Mutual', 'TenantVoluntaryBreak', 'TenantViolationClaim', 'LandlordViolationClaim', 'UnilateralLandlord', 'LandlordArbitraryBreak']]
    }
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  evidence_urls: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  reject_evidence_urls: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  request_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  requested_termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_unilateral: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'DISPUTED'),
    defaultValue: 'PENDING',
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  review_note: {
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
  tableName: 'termination_requests',
  timestamps: false,
  indexes: [
    {
      fields: ['contract_id'],
    },
    {
      fields: ['requested_by'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = TerminationRequest;
