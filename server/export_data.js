require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('./src/config/database');
const { 
  Role, User, Facility, Room, RoomImage, RoomFacility, 
  RentalRequest, ViewingSchedule, Contract, Payment, Complaint, 
  Notification, Conversation, Message, Booking, Favorite, OtpVerification
} = require('./src/models');

const escapeString = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? '1' : '0';
  if (typeof str === 'number') return str;
  if (str instanceof Date) return `'${str.toISOString().replace('T', ' ').substring(0, 19)}'`;
  
  // Escape single quotes by doubling them
  return `N'${String(str).replace(/'/g, "''")}'`;
};

async function exportData() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const sqlFilePath = path.join(__dirname, '../Database/rentalroomsystem.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Remove existing INSERT statements from the schema file
    // We assume the inserts start at "-- 1. ROLES" or similar and we'll just replace everything from "INSERT INTO roles" onwards
    const insertStartIndex = sqlContent.indexOf('INSERT INTO roles');
    if (insertStartIndex !== -1) {
      sqlContent = sqlContent.substring(0, insertStartIndex);
    }

    const tables = [
      { model: Role, name: 'roles', hasIdentity: true },
      { model: User, name: 'users', hasIdentity: true },
      { model: Facility, name: 'facilities', hasIdentity: true },
      { model: Room, name: 'rooms', hasIdentity: true },
      { model: RoomImage, name: 'room_images', hasIdentity: true },
      { model: RoomFacility, name: 'room_facilities', hasIdentity: true },
      { model: RentalRequest, name: 'rental_requests', hasIdentity: true },
      { model: ViewingSchedule, name: 'viewing_schedules', hasIdentity: true },
      { model: Contract, name: 'contracts', hasIdentity: true },
      { model: Payment, name: 'payments', hasIdentity: true },
      { model: Complaint, name: 'complaints', hasIdentity: true },
      { model: Notification, name: 'notifications', hasIdentity: true },
      { model: Conversation, name: 'conversations', hasIdentity: true },
      { model: Message, name: 'messages', hasIdentity: true },
      { model: Booking, name: 'bookings', hasIdentity: true },
      { model: Favorite, name: 'favorites', hasIdentity: true }
    ];

    let dataScript = '\n-- =========================================================\n-- DATA EXPORT\n-- =========================================================\n\n';

    for (const table of tables) {
      console.log(`Exporting ${table.name}...`);
      const rows = await table.model.findAll({ raw: true });
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      
      if (table.hasIdentity) {
        dataScript += `SET IDENTITY_INSERT ${table.name} ON;\nGO\n`;
      }

      // Chunk inserts to avoid massive single statements
      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        
        dataScript += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES\n`;
        
        const valueStrings = chunk.map(row => {
          const values = columns.map(col => escapeString(row[col]));
          return `(${values.join(', ')})`;
        });
        
        dataScript += valueStrings.join(',\n') + ';\n';
      }

      if (table.hasIdentity) {
        dataScript += `SET IDENTITY_INSERT ${table.name} OFF;\nGO\n\n`;
      } else {
        dataScript += `GO\n\n`;
      }
    }

    fs.writeFileSync(sqlFilePath, sqlContent + dataScript);
    console.log('Data successfully exported to rentalroomsystem.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

exportData();
