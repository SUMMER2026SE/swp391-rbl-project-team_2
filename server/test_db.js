require('dotenv').config();
const { Room } = require('./src/models');

async function test() {
  const rooms = await Room.findAll({ limit: 5 });
  console.log("Found rooms count:", rooms.length);
  if (rooms.length > 0) {
    console.log("Sample room status:", rooms[0].status);
  }
}
test().catch(console.error);
