const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    // Delete the duplicate draft contract
    await sequelize.query(`DELETE FROM contracts WHERE contract_id = 5`);
    
    // Delete the old rental request that created it
    await sequelize.query(`DELETE FROM rental_requests WHERE request_id = 5`);

    console.log('Successfully cleaned up old duplicate contract and request.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
