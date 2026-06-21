require('dotenv').config();
const sequelize = require('./src/config/database');

const check = async () => {
  try {
    const [rooms] = await sequelize.query(`SELECT room_id, title, status FROM rooms WHERE title LIKE '%Bach Khoa%'`);
    console.log(rooms);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

check();
