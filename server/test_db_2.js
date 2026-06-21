require('dotenv').config();
const { Room, Facility, defineAssociations } = require('./src/models');
defineAssociations();

async function test() {
  try {
    const availableRooms = await Room.findAll({
      where: { status: 'available' },
      order: [['created_at', 'DESC']],
      include: [{ model: Facility, as: 'facilities', attributes: ['facility_name'], through: { attributes: [] } }]
    });
    console.log("Success! Found:", availableRooms.length);
  } catch (err) {
    console.error("Error:", err);
  }
}
test().catch(console.error);
