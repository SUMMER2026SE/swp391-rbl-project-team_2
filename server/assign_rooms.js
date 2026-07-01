const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

async function assignRooms() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const contracts = await sequelize.query(
      `SELECT contract_id, tenant_name FROM Contracts WHERE assigned_room_number IS NULL OR assigned_room_number = ''`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let roomNumber = 101;
    for (const contract of contracts) {
      console.log(`Assigning room ${roomNumber} to ${contract.tenant_name} (Contract ID: ${contract.contract_id})`);
      await sequelize.query(
        `UPDATE Contracts SET assigned_room_number = :roomNum WHERE contract_id = :id`,
        {
          replacements: { roomNum: roomNumber.toString(), id: contract.contract_id },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      roomNumber++;
    }

    console.log('Successfully assigned room numbers!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignRooms();
