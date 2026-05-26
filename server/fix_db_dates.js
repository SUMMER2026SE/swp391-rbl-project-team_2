require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected. Altering tables...');
    
    await sequelize.query('ALTER TABLE users ALTER COLUMN created_at DATETIMEOFFSET;');
    await sequelize.query('ALTER TABLE users ALTER COLUMN updated_at DATETIMEOFFSET;');
    
    await sequelize.query('ALTER TABLE otp_verifications ALTER COLUMN expired_at DATETIMEOFFSET;');
    await sequelize.query('ALTER TABLE otp_verifications ALTER COLUMN created_at DATETIMEOFFSET;');
    
    console.log('Successfully altered columns to DATETIMEOFFSET!');
  } catch (error) {
    console.error('Error altering tables:', error.message);
  }
  process.exit(0);
})();
