const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

async function run() {
  try {
    await sequelize.authenticate();
    
    // Find rooms for property 4
    const rooms = await sequelize.query('SELECT room_id, title, floor, quantity FROM Rooms WHERE property_id = 4 ORDER BY floor ASC, room_id ASC', { type: Sequelize.QueryTypes.SELECT });
    
    let floorCounters = {};
    for (const room of rooms) {
       const floor = room.floor || 1;
       if (!floorCounters[floor]) floorCounters[floor] = 1;
       
       let numbers = [];
       const qty = room.quantity || 1;
       for (let i = 0; i < qty; i++) {
           const num = floor * 100 + floorCounters[floor];
           numbers.push(`${num}`);
           floorCounters[floor]++;
       }
       const numStr = numbers.join(', ');
       await sequelize.query('UPDATE Rooms SET room_number = :numStr WHERE room_id = :id', {
           replacements: { numStr, id: room.room_id },
           type: Sequelize.QueryTypes.UPDATE
       });
       console.log(`Updated room_id ${room.room_id} to ${numStr}`);
    }
    
    console.log('Successfully updated room numbers!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
