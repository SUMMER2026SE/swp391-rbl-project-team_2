const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

sequelize.query("UPDATE rooms SET status = 'available' WHERE room_id = 66")
  .then(() => { 
    console.log("Room 66 status reset to available."); 
    process.exit(0); 
  })
  .catch(err => { console.error(err); process.exit(1); });
