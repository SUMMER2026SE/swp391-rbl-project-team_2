const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  room_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ward: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  price_per_month: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  area_sqm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  room_type: {
    type: DataTypes.STRING(15),
    defaultValue: 'single',
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  max_occupants: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.STRING(15),
    defaultValue: 'available',
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'rooms',
  timestamps: false,
  indexes: [
    {
      fields: ['landlord_id'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = Room;
