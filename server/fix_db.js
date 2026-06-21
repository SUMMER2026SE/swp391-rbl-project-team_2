const sequelize = require('./src/config/database');

async function fixDb() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    
    // Alter payments table to allow NULL for contract_id
    await sequelize.query('ALTER TABLE payments ALTER COLUMN contract_id INT NULL;');
    console.log('Successfully altered payments table.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error altering table:', error);
    process.exit(1);
  }
}

fixDb();
