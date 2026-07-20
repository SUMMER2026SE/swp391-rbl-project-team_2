const sequelize = require('./src/config/database');

async function dropConstraint() {
  try {
    const [constraints] = await sequelize.query(`
      SELECT obj.name AS constraint_name
      FROM sys.check_constraints obj
      JOIN sys.columns col ON obj.parent_object_id = col.object_id AND obj.parent_column_id = col.column_id
      WHERE obj.parent_object_id = OBJECT_ID('termination_requests') AND col.name = 'termination_type'
    `);
    
    if (constraints.length > 0) {
      const constraintName = constraints[0].constraint_name;
      console.log('Dropping constraint:', constraintName);
      await sequelize.query(`ALTER TABLE termination_requests DROP CONSTRAINT ${constraintName}`);
      console.log('Constraint dropped.');
    } else {
      console.log('No check constraint found.');
    }

    // Now alter the column
    await sequelize.query(`ALTER TABLE termination_requests ALTER COLUMN termination_type VARCHAR(50) NOT NULL`);
    console.log('Column altered to VARCHAR(50).');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropConstraint();
