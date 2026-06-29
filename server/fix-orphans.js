const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const deleteQuery = `
      DELETE FROM contracts 
      WHERE status = 'draft' 
      AND room_id IN (
        SELECT room_id FROM rental_requests WHERE status = 'approved'
      );
    `;
    await sequelize.query(deleteQuery);
    console.log('Successfully deleted orphaned draft contracts.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
