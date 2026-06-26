const { sequelize, Contract } = require('./src/models');

async function syncContract() {
  try {
    await sequelize.query('ALTER TABLE contracts ADD tenant_name NVARCHAR(255) NULL, landlord_name NVARCHAR(255) NULL;');
    console.log('Contract table altered successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error altering table:', error);
    process.exit(1);
  }
}

syncContract();
