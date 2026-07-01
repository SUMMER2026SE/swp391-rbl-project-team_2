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
    
    // Find rooms and assign comma separated numbers
    const rooms = await sequelize.query('SELECT room_id, title, floor, quantity FROM Rooms', { type: Sequelize.QueryTypes.SELECT });
    
    for (const room of rooms) {
       let numbers = [];
       for (let i = 1; i <= room.quantity; i++) {
           numbers.push(`${room.floor}0${i}`);
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
