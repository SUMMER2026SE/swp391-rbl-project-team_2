const { sequelize, Room } = require('./src/models');
const { Op } = require('sequelize');

async function checkRooms() {
  try {
    const { count, rows } = await Room.findAndCountAll({
      where: { is_deleted: false, status: { [Op.notIn]: ['inactive', 'pending', 'rejected'] } },
      attributes: ['room_id', 'title', 'status', 'is_deleted', 'price_per_month', 'property_id'],
    });
    console.log("getAllPublicRooms result:", rows.map(r => r.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRooms();
