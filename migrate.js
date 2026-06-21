const sequelize = require('./server/src/config/database');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    // Check if columns exist first to avoid errors
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'viewing_schedules'
      AND COLUMN_NAME IN ('payment_deadline', 'dispute_reason')
    `);
    
    const existingColumns = results.map(r => r.COLUMN_NAME);
    
    if (!existingColumns.includes('payment_deadline')) {
      await sequelize.query('ALTER TABLE viewing_schedules ADD payment_deadline DATETIME NULL');
      console.log('Added payment_deadline column');
    }
    
    if (!existingColumns.includes('dispute_reason')) {
      await sequelize.query('ALTER TABLE viewing_schedules ADD dispute_reason TEXT NULL');
      console.log('Added dispute_reason column');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

migrate();
