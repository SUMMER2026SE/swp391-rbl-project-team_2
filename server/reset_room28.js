require('dotenv').config();
const sequelize = require('./src/config/database');
sequelize.query("UPDATE Rooms SET status = 'available' WHERE room_id = 28").then(() => {
  console.log('Room 28 set to available');
  process.exit(0);
});
