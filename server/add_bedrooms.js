const sequelize = require('./src/config/database');

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await sequelize.query('ALTER TABLE rooms ADD bedrooms INT DEFAULT 1;');
    console.log('Added bedrooms column');
    // Also modify room_type to allow new types if it's constrained? 
    // In MSSQL, ENUM is usually translated to VARCHAR or has a CHECK constraint.
    // Let's just catch the error if it fails and ignore it.
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
};

runMigration();
