const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

sequelize.query('SELECT TOP 1 * FROM contracts ORDER BY contract_id DESC')
  .then(res => { console.log(res[0]); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
