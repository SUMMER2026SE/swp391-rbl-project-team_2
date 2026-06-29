const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const emails = ['williamlata02@gmail.com', 'williamlata03@gmail.com'];
    
    // First get the user IDs
    const [users] = await sequelize.query(`SELECT user_id, email FROM users WHERE email IN ('williamlata02@gmail.com', 'williamlata03@gmail.com')`);
    
    if (users.length === 0) {
      console.log('No users found to delete.');
      process.exit(0);
    }
    
    const userIds = users.map(u => u.user_id).join(',');
    
    // Delete related records
    await sequelize.query(`DELETE FROM otp_verifications WHERE user_id IN (${userIds})`);
    await sequelize.query(`DELETE FROM notifications WHERE user_id IN (${userIds})`);
    await sequelize.query(`DELETE FROM viewing_schedules WHERE tenant_id IN (${userIds}) OR landlord_id IN (${userIds})`);
    await sequelize.query(`DELETE FROM properties WHERE landlord_id IN (${userIds})`);
    await sequelize.query(`DELETE FROM rooms WHERE landlord_id IN (${userIds})`);
    
    // Delete the users
    await sequelize.query(`DELETE FROM users WHERE user_id IN (${userIds})`);
    
    console.log(`✅ Deleted accounts successfully.`);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

run();
