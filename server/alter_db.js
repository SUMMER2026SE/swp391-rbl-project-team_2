require('dotenv').config();
const sequelize = require('./src/config/database');

async function run() {
  try {
    // 1. Get default constraint on 'status'
    const [constraints] = await sequelize.query(`
      SELECT d.name 
      FROM sys.default_constraints d 
      INNER JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id 
      WHERE d.parent_object_id = OBJECT_ID('rental_requests') AND c.name = 'status'
    `);
    
    if (constraints.length > 0) {
      await sequelize.query(`ALTER TABLE rental_requests DROP CONSTRAINT ${constraints[0].name}`);
      console.log('Dropped default constraint:', constraints[0].name);
    }

    // 2. Get indexes on 'status'
    const [indexes] = await sequelize.query(`
      SELECT i.name 
      FROM sys.indexes i 
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id 
      INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id 
      WHERE i.object_id = OBJECT_ID('rental_requests') AND c.name = 'status'
    `);

    for (let index of indexes) {
      await sequelize.query(`DROP INDEX ${index.name} ON rental_requests`);
      console.log('Dropped index:', index.name);
    }

    // 3. Alter column
    await sequelize.query('ALTER TABLE rental_requests ALTER COLUMN status VARCHAR(50)');
    console.log('Altered column status to VARCHAR(50)');

    // 4. Recreate index
    await sequelize.query('CREATE INDEX rental_requests_status ON rental_requests(status)');
    console.log('Recreated index');

    // 5. Recreate default constraint
    await sequelize.query("ALTER TABLE rental_requests ADD DEFAULT 'pending' FOR status");
    console.log('Recreated default constraint');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
