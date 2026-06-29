const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const alterQuery = `
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('contracts') AND name = 'tenant_name')
      BEGIN
        ALTER TABLE contracts ADD 
          tenant_name nvarchar(100) NULL,
          tenant_ic varchar(20) NULL,
          tenant_ic_issue_date date NULL,
          tenant_ic_issue_place nvarchar(255) NULL,
          tenant_permanent_address nvarchar(255) NULL;
      END
    `;
    await sequelize.query(alterQuery);
    console.log('Successfully added tenant identity columns to contracts table.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
