const { sequelize } = require('./src/models');
require('dotenv').config();

const checkUsersTable = async () => {
  try {
    console.log('🔍 Checking users table structure...');

    // Get table structure
    const columns = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = 'dbo'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 Users table columns:');
    columns[0].forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    // Try to insert a test user
    console.log('\n🧪 Testing insert...');
    const result = await sequelize.query(`
      INSERT INTO users (full_name, email, password_hash, role_id, is_active, is_banned, is_deleted, created_at, updated_at)
      VALUES ('Test User', 'test@example.com', 'hash123', 3, 0, 0, 0, GETDATE(), GETDATE())
    `);
    
    console.log('✅ Insert successful');

    // Check if user was inserted
    const users = await sequelize.query(`
      SELECT * FROM users WHERE email = 'test@example.com'
    `);
    
    console.log('✅ User found:', users[0][0]);

    // Clean up
    await sequelize.query(`
      DELETE FROM users WHERE email = 'test@example.com'
    `);
    
    console.log('✅ Test user deleted');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkUsersTable();
