/**
 * Quick fix script to add missing columns to the rooms table.
 * Run with: node fix_db.js
 */
const sequelize = require('./src/config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Add missing columns to rooms table
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rooms') AND name = 'quantity')
      BEGIN
          ALTER TABLE rooms ADD quantity INT DEFAULT 1;
          PRINT 'Added quantity column';
      END
      ELSE
          PRINT 'quantity column already exists';
    `);

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rooms') AND name = 'available_quantity')
      BEGIN
          ALTER TABLE rooms ADD available_quantity INT DEFAULT 1;
          PRINT 'Added available_quantity column';
      END
      ELSE
          PRINT 'available_quantity column already exists';
    `);

    console.log('✅ Fix applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fix();
