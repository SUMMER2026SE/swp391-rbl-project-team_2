require('dotenv').config();
const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Drop table if exists to ensure clean slate
    await sequelize.query(`
      IF OBJECT_ID('bookings', 'U') IS NOT NULL
        DROP TABLE bookings;
    `);

    // Create bookings table
    await sequelize.query(`
      CREATE TABLE bookings (
          booking_id INT IDENTITY PRIMARY KEY,
          listing_id INT NOT NULL,
          tenant_id INT NOT NULL,
          landlord_id INT NOT NULL,
          type VARCHAR(50) NOT NULL, -- 'view_request' | 'deposit'
          status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
          created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
          updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
          FOREIGN KEY (listing_id) REFERENCES rooms(room_id),
          FOREIGN KEY (tenant_id) REFERENCES users(user_id),
          FOREIGN KEY (landlord_id) REFERENCES users(user_id)
      );
    `);
    console.log('✅ Created bookings table successfully!');

  } catch (error) {
    console.error('❌ Failed to create table:', error);
  } finally {
    await sequelize.close();
  }
}

run();
