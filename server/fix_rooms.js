require('dotenv').config();
const sequelize = require('./src/config/database');

const fix = async () => {
  try {
    const [schedules] = await sequelize.query(`SELECT room_id FROM viewing_schedules WHERE status IN ('scheduled', 'pending_payment')`);
    const roomIds = schedules.map(s => s.room_id);
    if (roomIds.length > 0) {
      await sequelize.query(`UPDATE rooms SET status = 'unavailable' WHERE room_id IN (${roomIds.join(',')})`);
      console.log('Fixed rooms: ', roomIds);
    } else {
      console.log('No rooms need fixing.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

fix();
