require('dotenv').config();
const sequelize = require('./src/config/database');
const { Contract, RentalRequest } = require('./src/models');

async function syncData() {
  try {
    const contracts = await Contract.findAll();
    for (const contract of contracts) {
      if (!contract.start_date || !contract.end_date) continue;
      
      // calculate duration
      const duration = Math.round((new Date(contract.end_date) - new Date(contract.start_date)) / (1000 * 60 * 60 * 24 * 30));
      
      await RentalRequest.update({
        requested_move_in_date: contract.start_date,
        lease_duration_months: duration
      }, {
        where: {
          room_id: contract.room_id,
          tenant_id: contract.tenant_id
        }
      });
    }
    console.log('Synced successfully!');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
syncData();
