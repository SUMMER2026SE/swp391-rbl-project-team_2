const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

sequelize.query("UPDATE rooms SET is_deleted = 0 WHERE room_id = 66")
  .then(() => { 
    console.log("Restored room 66"); 
    process.exit(0); 
  })
  .catch(err => { console.error(err); process.exit(1); });
