const { Room } = require('./src/models');
async function test() {
  const rooms = await Room.findAll({ limit: 5 });
  for(let r of rooms) {
    console.log(`ID: ${r.room_id}, Status: ${r.status}, Qty: ${r.quantity}, AvailQty: ${r.available_quantity}`);
  }
  process.exit(0);
}
test();
