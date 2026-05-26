require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    const [results, metadata] = await sequelize.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'roles';");
    console.log(results);
  } catch (error) {
    console.error(error.message);
  }
  process.exit(0);
})();
