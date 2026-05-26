require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    const [results, metadata] = await sequelize.query("SELECT [role_id], [role_name], [description], [created_at], [updated_at] FROM [roles] AS [Role] WHERE [Role].[role_name] = N'Tenant';");
    console.log(results);
  } catch (error) {
    console.error('ERROR MESSAGE:', error.message);
    if (error.original && error.original.errors) {
       error.original.errors.forEach(e => console.error(e.message));
    }
  }
  process.exit(0);
})();
