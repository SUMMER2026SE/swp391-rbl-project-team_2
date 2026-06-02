const { Sequelize } = require('sequelize');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Connect to master database to drop and recreate the target database
    const masterSequelize = new Sequelize('master', process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      },
      logging: false,
    });

    // Drop existing database
    try {
      // Kill all connections to the database first
      await masterSequelize.query(`
        ALTER DATABASE [${process.env.DB_NAME}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${process.env.DB_NAME}];
      `);
      console.log('✅ Old database dropped');
    } catch (error) {
      console.log('⚠️  Database does not exist or already dropped:', error.message);
    }

    // Create new database
    await masterSequelize.query(`CREATE DATABASE [${process.env.DB_NAME}]`);
    console.log('✅ New database created');

    // Close master connection
    await masterSequelize.close();

    // Now sync with the new database
    const { sequelize } = require('./src/models');
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced');

    // Create default roles
    const { Role } = require('./src/models');
    await Role.bulkCreate([
      { role_name: 'Admin', description: 'Administrator' },
      { role_name: 'Landlord', description: 'Property Owner' },
      { role_name: 'Tenant', description: 'Renter' },
    ]);
    console.log('✅ Default roles created');

    console.log('✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

resetDatabase();
