const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const alterQuery = `
      ALTER TABLE rental_requests ALTER COLUMN status VARCHAR(50);
    `;
    await sequelize.query(alterQuery);
    console.log('Successfully altered rental_requests status column.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
