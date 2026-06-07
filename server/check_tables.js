const {sequelize} = require('./src/models');

sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME")
  .then(([rows]) => {
    console.log('Tables in database:');
    rows.forEach(r => console.log('  -', r.TABLE_NAME));
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
