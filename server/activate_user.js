require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("UPDATE users SET is_active = 1 WHERE email = 'nhatkhaiphone@gmail.com'");
    console.log('User activated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
