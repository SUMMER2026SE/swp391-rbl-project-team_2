const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

sequelize.query("EXEC sp_columns 'contracts'")
  .then(res => { 
    console.table(res[0].map(c => ({ column: c.COLUMN_NAME, type: c.TYPE_NAME }))); 
    process.exit(0); 
  })
  .catch(err => { console.error(err); process.exit(1); });
