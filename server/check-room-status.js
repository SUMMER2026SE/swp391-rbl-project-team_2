const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

sequelize.query("SELECT room_id, title, status FROM rooms WHERE room_id = 66")
  .then(res => { 
    console.table(res[0]); 
    process.exit(0); 
  })
  .catch(err => { console.error(err); process.exit(1); });
