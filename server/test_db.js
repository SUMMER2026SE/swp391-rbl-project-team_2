const { Op } = require('sequelize');
const { Room } = require('./src/models');

async function test() {
  const rooms = await Room.findAll({
    where: {
      city: { [Op.like]: '%Đà Nẵng%' }
    },
    attributes: ['title', 'city', 'district', 'address']
  });
  console.log("Matching city '%Đà Nẵng%':", rooms.length);
  console.log(rooms.slice(0,2).map(r => r.toJSON()));
}
test().catch(console.error).finally(() => process.exit(0));
