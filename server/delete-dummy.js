const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    // Delete related records first
    await sequelize.query(`DELETE FROM room_images WHERE room_id IN (SELECT room_id FROM rooms WHERE title = 'dfgd')`);
    await sequelize.query(`DELETE FROM room_facilities WHERE room_id IN (SELECT room_id FROM rooms WHERE title = 'dfgd')`);
    await sequelize.query(`DELETE FROM viewing_schedules WHERE room_id IN (SELECT room_id FROM rooms WHERE title = 'dfgd')`);
    await sequelize.query(`DELETE FROM contracts WHERE room_id IN (SELECT room_id FROM rooms WHERE title = 'dfgd')`);
    
    // Delete the rooms
    const [result] = await sequelize.query(`DELETE FROM rooms WHERE title = 'dfgd'`);
    console.log(`✅ Deleted dummy rooms`);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

run();
