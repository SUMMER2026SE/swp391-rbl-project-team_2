const sequelize = require('./src/config/database');

async function fixData() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.query(`UPDATE payments SET payout_status = 'pending' WHERE payout_status IS NULL;`);
    await sequelize.query(`UPDATE payments SET platform_fee = 0 WHERE platform_fee IS NULL;`);
    await sequelize.query(`UPDATE payments SET net_amount = 0 WHERE net_amount IS NULL;`);
    
    console.log('Successfully updated existing payments');
  } catch (error) {
    console.error('Unable to connect to the database or update table:', error);
  } finally {
    process.exit(0);
  }
}

fixData();
