const { Sequelize } = require('sequelize');
const { Room, sequelize } = require('./server/src/models');

async function testSearch() {
  const keyword = "Đà"; // or "Da"
  try {
    const rooms = await Room.findAll({
      where: {
        title: sequelize.where(
          sequelize.col('title'),
          'LIKE',
          sequelize.literal(`N'%${keyword}%' COLLATE SQL_Latin1_General_CP1_CI_AI`)
        )
      },
      limit: 1
    });
    console.log("Success! Found:", rooms.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSearch();
