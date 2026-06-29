const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });
const { Contract, Room, User } = require('./src/models');

async function test() {
  try {
    const contract = await Contract.create({
      room_id: 1, // assumes room 1 exists
      tenant_id: 1,
      landlord_id: 1,
      contract_number: 'CT-TEST-1234',
      start_date: new Date(),
      end_date: new Date(),
      monthly_rent: 1000,
      deposit_amount: 1000,
      status: 'draft',
      tenant_name: 'Hoang Nhat Kha',
      tenant_ic: '123456789012',
      tenant_ic_issue_date: new Date(),
      tenant_ic_issue_place: 'Da Nang',
      tenant_permanent_address: 'Da Nang'
    });
    console.log('Success:', contract.contract_id);
    process.exit(0);
  } catch (err) {
    console.log('FULL ERROR OBJECT:', err);
    process.exit(1);
  }
}
test();
