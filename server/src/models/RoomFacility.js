const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomFacility = sequelize.define('RoomFacility', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  facility_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'room_facilities',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['room_id', 'facility_id']
    }
  ]
});

module.exports = RoomFacility;
