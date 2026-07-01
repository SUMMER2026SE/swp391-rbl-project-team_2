const { sequelize, Room } = require('./src/models');

async function checkRooms() {
  try {
    const rooms = await Room.findAll({
      attributes: ['room_id', 'title', 'status', 'is_deleted', 'price_per_month', 'property_id'],
    });
    console.log(rooms.map(r => r.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRooms();
