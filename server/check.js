require('dotenv').config();
const { Room, RentalRequest, Contract } = require('./src/models');
const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    const req = await RentalRequest.findByPk(8);
    if (!req) {
      console.log('Request 8 not found');
      return;
    }
    console.log('RentalRequest status:', req.status);
    
    const room = await Room.findByPk(req.room_id);
    console.log('Room available_quantity:', room ? room.available_quantity : 'No room');
    
    const draftContract = await Contract.findOne({
      where: {
        room_id: req.room_id,
        tenant_id: req.tenant_id,
        status: 'draft'
      }
    });
    console.log('Draft contract exists:', !!draftContract);
    if(draftContract) {
       console.log('Draft Contract tenant_id:', draftContract.tenant_id, 'room_id:', draftContract.room_id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
