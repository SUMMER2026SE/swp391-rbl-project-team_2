const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('RentalRoomSystem', 'sa', '123', { host: 'localhost', dialect: 'mssql', logging: false });

async function run() {
  try {
    const alterQuery = `
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('contracts') AND name = 'landlord_name')
      BEGIN
        ALTER TABLE contracts ADD 
          landlord_name nvarchar(100) NULL,
          landlord_ic varchar(20) NULL,
          landlord_ic_issue_date date NULL,
          landlord_ic_issue_place nvarchar(255) NULL,
          landlord_permanent_address nvarchar(255) NULL,
          landlord_signature nvarchar(max) NULL,
          tenant_signature nvarchar(max) NULL;
      END
    `;
    await sequelize.query(alterQuery);
    console.log('Successfully added landlord and signature columns to contracts table.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
