const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', {
  host: 'localhost',
  dialect: 'mssql',
  logging: false
});

async function run() {
  try {
    await sequelize.query('UPDATE rooms SET available_from = upcoming_vacancy_date WHERE upcoming_vacancy_date IS NOT NULL');
    console.log('Updated existing upcoming_vacancy_date fields.');
    await sequelize.query("UPDATE rooms SET available_from = '2026-07-31' WHERE title LIKE '%25m2%' AND available_from IS NULL");
    console.log('Forced Phòng 25m2 to have an available_from date.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
