const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function generate() {
  let sql = '';
  const modelsToExport = [
    'User',
    'Room',
    'RoomImage',
    'ViewingSchedule',
    'RentalRequest',
    'Contract',
    'Payment',
    'Complaint',
    'Review',
    'Notification'
  ];

  for (const modelName of modelsToExport) {
    if (!sequelize.models[modelName]) continue;
    const model = sequelize.models[modelName];
    const records = await model.findAll({ raw: true });
    if (records.length === 0) continue;

    sql += `-- =========================================\n`;
    sql += `-- Table: ${model.tableName}\n`;
    sql += `-- =========================================\n`;
    
    // Check if the table has an IDENTITY column (we'll just assume the first column is identity if it's an integer primary key)
    const primaryKeys = Object.keys(model.primaryKeys);
    let hasIdentity = false;
    if (primaryKeys.length === 1) {
      const pk = model.rawAttributes[primaryKeys[0]];
      if (pk.autoIncrement) {
        hasIdentity = true;
      }
    }

    if (hasIdentity) {
      sql += `SET IDENTITY_INSERT [${model.tableName}] ON;\n`;
    }

    for (const record of records) {
      const cols = Object.keys(record).map(k => '['+k+']').join(', ');
      const vals = Object.values(record).map(v => {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return v ? '1' : '0';
        if (v instanceof Date) {
          // SQL Server format: YYYY-MM-DD HH:MM:SS.mmm
          return `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
        }
        if (typeof v === 'string') {
          // Escape single quotes
          return `N'${v.replace(/'/g, "''")}'`;
        }
        if (typeof v === 'object') {
          return `N'${JSON.stringify(v).replace(/'/g, "''")}'`;
        }
        return v;
      }).join(', ');

      sql += `INSERT INTO [${model.tableName}] (${cols}) VALUES (${vals});\n`;
    }

    if (hasIdentity) {
      sql += `SET IDENTITY_INSERT [${model.tableName}] OFF;\n`;
    }
    sql += `\n`;
  }

  const outputPath = path.join(__dirname, '../Database/SmartRoomRentalSystem_CurrentData.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`Script saved to ${outputPath}`);
  process.exit(0);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
