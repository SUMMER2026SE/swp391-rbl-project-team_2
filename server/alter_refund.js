const sequelize = require('./src/config/database');

async function alterTable() {
  try {
    await sequelize.query(`ALTER TABLE termination_records ADD refund_status VARCHAR(50) DEFAULT 'NONE'`);
    console.log('Added refund_status');
  } catch (err) {
    console.error('Error adding refund_status:', err.message);
  }
  
  try {
    await sequelize.query(`ALTER TABLE termination_records ADD refund_proof_url TEXT`);
    console.log('Added refund_proof_url');
  } catch (err) {
    console.error('Error adding refund_proof_url:', err.message);
  }

  process.exit(0);
}

alterTable();
