const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const [requests] = await sequelize.query(`
      SELECT request_id, room_id, tenant_id, status 
      FROM rental_requests 
      ORDER BY created_at DESC
    `);
    console.log('--- Rental Requests ---');
    console.table(requests);

    const [contracts] = await sequelize.query(`
      SELECT contract_id, room_id, tenant_id, status 
      FROM contracts 
      ORDER BY created_at DESC
    `);
    console.log('--- Contracts ---');
    console.table(contracts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
