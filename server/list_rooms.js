const { Room, Facility, RoomImage } = require('./src/models');
async function listRooms() {
  const rooms = await Room.findAll({
    include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }],
    limit: 15
  });
  const data = rooms.map(r => ({
    id: r.room_id,
    title: r.title,
    type: r.room_type,
    facilities: r.facilities.map(f => f.facility_name).join(', ')
  }));
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
listRooms();
