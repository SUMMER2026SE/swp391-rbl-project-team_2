const sequelize = require('./server/src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    const queries = [
      "ALTER TABLE payments ADD refund_amount DECIMAL(10, 2) DEFAULT 0;"
    ];

    for (let q of queries) {
      try {
        await sequelize.query(q);
        console.log('Success:', q);
      } catch (err) {
        console.log('Skipped/Error on:', q, err.message);
      }
    }
    console.log('Done.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
