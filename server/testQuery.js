const { sequelize } = require('./src/models');

async function checkColumns() {
  try {
    const result = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'contracts'
    `);
    console.log(result[0].map(r => r.COLUMN_NAME).join(', '));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkColumns();
