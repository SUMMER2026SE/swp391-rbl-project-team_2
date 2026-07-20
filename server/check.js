const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', {
  host: 'localhost',
  dialect: 'mssql',
  logging: false
});

async function run() {
  const [results] = await sequelize.query(`
    SELECT r.room_id, r.title, r.status, r.available_from, p.title as property_title
    FROM rooms r
    LEFT JOIN properties p ON r.property_id = p.property_id
    WHERE r.title LIKE '%25m2%' OR p.title LIKE '%Kha%'
  `);
  console.log(results);
  process.exit(0);
}
run();
