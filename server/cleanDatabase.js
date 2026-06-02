const { Sequelize } = require('sequelize');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    console.log('🔄 Cleaning database...');
    
    // Connect to the database
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
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
      }
    );

    // List of tables to drop in reverse order of dependencies
    const tables = [
      'messages',
      'notifications',
      'complaints',
      'viewing_schedules',
      'payments',
      'contracts',
      'rental_requests',
      'facilities',
      'room_images',
      'conversations',
      'rooms',
      'otp_verifications',
      'users',
      'roles',
    ];

    // Drop each table
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS [${table}]`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}: ${error.message}`);
      }
    }

    // Close connection
    await sequelize.close();

    console.log('✅ Database cleaned successfully!');
    console.log('⏳ Please run: npm start');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

cleanDatabase();
