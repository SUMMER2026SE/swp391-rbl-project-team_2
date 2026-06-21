const { sequelize } = require('./src/models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connection established.');

    // Drop tables if they exist
    try {
      await sequelize.query('DROP TABLE room_facilities;');
    } catch(e) {}
    try {
      await sequelize.query('DROP TABLE facilities;');
    } catch(e) {}

    // 1. Create facilities (master table)
    await sequelize.query(`
      CREATE TABLE facilities (
          facility_id INT IDENTITY PRIMARY KEY,
          facility_name NVARCHAR(100) NOT NULL UNIQUE,
          category VARCHAR(15) DEFAULT 'room',
          facility_type VARCHAR(50) DEFAULT 'other',
          created_at DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('Created facilities table.');

    // 2. Create room_facilities (junction table)
    await sequelize.query(`
      CREATE TABLE room_facilities (
          id INT IDENTITY PRIMARY KEY,
          room_id INT NOT NULL,
          facility_id INT NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),

          FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
          FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE,
          CONSTRAINT UQ_Room_Facility UNIQUE(room_id, facility_id)
      );
    `);
    console.log('Created room_facilities table.');

    // Seed facilities
    const defaultFacilities = [
      { name: 'WiFi', category: 'room', type: 'utility' },
      { name: 'Air Conditioner', category: 'room', type: 'appliance' },
      { name: 'Parking', category: 'room', type: 'utility' },
      { name: 'Private Bathroom', category: 'room', type: 'utility' },
      { name: 'Balcony', category: 'room', type: 'utility' },
      { name: 'Bed', category: 'room', type: 'furniture' },
      { name: 'Wardrobe', category: 'room', type: 'furniture' },
      { name: 'Kitchen', category: 'room', type: 'utility' },
      { name: 'Security Camera', category: 'room', type: 'security' },
      { name: 'Near University', category: 'nearby', type: 'education' },
      { name: 'Near Hospital', category: 'nearby', type: 'hospital' },
      { name: 'Near Supermarket', category: 'nearby', type: 'shopping' },
      { name: 'Near Bus Station', category: 'nearby', type: 'transport' },
      { name: 'Near Market', category: 'nearby', type: 'shopping' },
      { name: 'Near Park', category: 'nearby', type: 'recreation' },
      { name: 'Near Convenience Store', category: 'nearby', type: 'shopping' },
    ];

    for (const f of defaultFacilities) {
      await sequelize.query(`
        INSERT INTO facilities (facility_name, category, facility_type)
        VALUES ('${f.name}', '${f.category}', '${f.type}');
      `);
    }
    console.log('Seeded default facilities.');

    process.exit(0);
  } catch(e) { 
    console.error(e); 
    process.exit(1); 
  }
}

migrate();
