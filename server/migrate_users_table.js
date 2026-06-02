const { sequelize } = require('./src/models');
require('dotenv').config();

const migrateUsersTable = async () => {
  try {
    console.log('🔄 Migrating users table...');

    // Check if columns exist
    const columns = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = 'dbo'
    `);
    
    const columnNames = columns[0].map(col => col.COLUMN_NAME);
    console.log('📋 Existing columns:', columnNames);

    // Add missing columns
    const missingColumns = [];

    if (!columnNames.includes('avatar_url')) {
      console.log('➕ Adding avatar_url column...');
      await sequelize.query(`
        ALTER TABLE users ADD avatar_url VARCHAR(500) NULL
      `);
      missingColumns.push('avatar_url');
    }

    if (!columnNames.includes('google_id')) {
      console.log('➕ Adding google_id column...');
      await sequelize.query(`
        ALTER TABLE users ADD google_id VARCHAR(255) NULL
      `);
      missingColumns.push('google_id');
    }

    if (missingColumns.length > 0) {
      console.log(`✅ Added ${missingColumns.length} columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('ℹ️  All columns already exist');
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

migrateUsersTable();
