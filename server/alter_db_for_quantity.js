const sequelize = require('./src/config/database');

async function alterDb() {
  try {
    console.log('Authenticating with database...');
    await sequelize.authenticate();
    
    console.log('Adding quantity and available_quantity to rooms table...');
    await sequelize.query('ALTER TABLE rooms ADD quantity INT DEFAULT 1;');
    await sequelize.query('ALTER TABLE rooms ADD available_quantity INT DEFAULT 1;');
    
    console.log('Adding assigned_room_number to contracts table...');
    await sequelize.query('ALTER TABLE contracts ADD assigned_room_number VARCHAR(50) DEFAULT NULL;');
    
    
    console.log('Database altered successfully!');
    process.exit(0);
  } catch (err) {
    // Ignore errors if columns already exist
    console.log('Error altering database:', err.message);
    process.exit(0);
  }
}

alterDb();
