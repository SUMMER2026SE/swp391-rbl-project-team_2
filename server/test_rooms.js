const { Room } = require('./src/models');
async function test() {
  const count = await Room.count();
  console.log("Total rooms in DB:", count);
}
test();
