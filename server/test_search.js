const { Sequelize } = require('sequelize');
const { Room, sequelize } = require('./src/models');

async function testSearch() {
  const keyword = "da nang";
  try {
    const rooms = await Room.findAll({
      where: sequelize.where(
        sequelize.col('title'),
        'LIKE',
        sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)
      ),
      limit: 1,
      logging: console.log
    });
    console.log("Success! Found:", rooms.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSearch();
