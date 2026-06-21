const { sequelize } = require('./src/models');
async function alter() {
  try {
    await sequelize.authenticate();
    try {
      await sequelize.query(`ALTER TABLE facilities ADD category VARCHAR(15) DEFAULT 'room'`);
      console.log('Added category column');
    } catch(e) { console.log('Column might already exist'); }
    try {
      await sequelize.query(`ALTER TABLE facilities ALTER COLUMN facility_type VARCHAR(50)`);
      console.log('Altered facility_type column');
    } catch(e) { console.log('Could not alter facility_type'); }
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
alter();
