require('dotenv').config();
const sequelize = require('./src/config/database');
sequelize.query("UPDATE Rooms SET status = 'available' WHERE room_id = 23").then(() => {
  console.log('Room 23 set to available');
  process.exit(0);
});
