require('dotenv').config();
const sequelize = require('./src/config/database');

const targets = [
  { table: 'users', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'users', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'otp_verifications', column: 'expired_at', isNullable: false, hasDefault: false },
  { table: 'otp_verifications', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'rooms', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'rooms', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'rental_requests', column: 'requested_move_in_date', isNullable: true, hasDefault: false },
  { table: 'rental_requests', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'rental_requests', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'payments', column: 'paid_at', isNullable: true, hasDefault: false },
  { table: 'payments', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'payments', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'contracts', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'contracts', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'conversations', column: 'last_message_at', isNullable: true, hasDefault: false },
  { table: 'conversations', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'conversations', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'messages', column: 'read_at', isNullable: true, hasDefault: false },
  { table: 'messages', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'notifications', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'notifications', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'complaints', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'complaints', column: 'updated_at', isNullable: true, hasDefault: true },
  { table: 'viewing_schedules', column: 'scheduled_date', isNullable: false, hasDefault: false },
  { table: 'viewing_schedules', column: 'created_at', isNullable: true, hasDefault: true },
  { table: 'viewing_schedules', column: 'updated_at', isNullable: true, hasDefault: true },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database. Starting robust datetime migrations...');

    for (const target of targets) {
      console.log(`\n⏳ Migrating column [${target.column}] on table [${target.table}]...`);

      // 0. Check if column exists
      const checkColumnQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${target.table}' AND COLUMN_NAME = '${target.column}';
      `;
      const [colResults] = await sequelize.query(checkColumnQuery);
      if (!colResults || colResults.length === 0) {
        console.log(`   - Column [${target.column}] does not exist in table [${target.table}]. Skipping...`);
        continue;
      }

      // 1. Find existing default constraint (if any)
      const findConstraintQuery = `
        SELECT d.name 
        FROM sys.default_constraints d
        INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
        WHERE d.parent_object_id = OBJECT_ID('${target.table}') AND c.name = '${target.column}';
      `;
      const [results] = await sequelize.query(findConstraintQuery);
      
      if (results && results.length > 0) {
        const constraintName = results[0].name;
        console.log(`   - Found default constraint: ${constraintName}. Dropping...`);
        await sequelize.query(`ALTER TABLE [${target.table}] DROP CONSTRAINT [${constraintName}];`);
      } else {
        console.log(`   - No default constraint found.`);
      }

      // 2. Alter column type to DATETIMEOFFSET
      const nullability = target.isNullable ? 'NULL' : 'NOT NULL';
      console.log(`   - Altering column type to DATETIMEOFFSET ${nullability}...`);
      await sequelize.query(`ALTER TABLE [${target.table}] ALTER COLUMN [${target.column}] DATETIMEOFFSET ${nullability};`);

      // 3. Re-add default constraint if it had one
      if (target.hasDefault) {
        console.log(`   - Adding SYSDATETIMEOFFSET() default constraint...`);
        const dfName = `DF_${target.table}_${target.column}_offset`;
        await sequelize.query(`ALTER TABLE [${target.table}] ADD CONSTRAINT [${dfName}] DEFAULT SYSDATETIMEOFFSET() FOR [${target.column}];`);
      }
      
      console.log(`✅ Column [${target.column}] on table [${target.table}] migrated successfully.`);
    }

    console.log('\n🎉 ALL DATETIME COLUMNS SUCCESSFULLY CONVERTED TO DATETIMEOFFSET!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

run();
