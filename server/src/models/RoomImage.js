const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomImage = sequelize.define('RoomImage', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'room_images',
  timestamps: false,
  indexes: [
    {
      fields: ['room_id'],
    },
  ],
});

module.exports = RoomImage;
