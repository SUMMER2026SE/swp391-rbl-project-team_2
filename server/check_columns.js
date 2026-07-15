const seq = require('./src/config/database');
async function check() {
  try {
    await seq.authenticate();
    const [results] = await seq.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'rooms' ORDER BY ORDINAL_POSITION");
    console.log('Columns:', results.map(r => r.COLUMN_NAME).join(', '));
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
}
check();
