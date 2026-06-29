const { Sequelize, Op } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });
sequelize.query(SELECT room_id, title, room_number, property_id, status FROM rooms WHERE status = 'pending')
  .then(res => { console.table(res[0]); process.exit(0); })
  .catch(err => { console.error(err.message); process.exit(1); });
