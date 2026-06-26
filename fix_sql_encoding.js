const fs = require('fs');

const files = [
  'Database/SmartRoomRentalSystem_TestData.sql',
  'Database/SmartRoomRentalSystem_Test2.sql',
  'Database/SmartRoomRentalSystem.sql',
  'server/Full_Database_Script.sql'
];

for (let file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add N prefix to all string literals
    // The regex matches any single-quoted string that is not preceded by an N
    const newContent = content.replace(/(?<!N)('(?:[^']|'')*')/g, 'N$1');
    
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Added N prefixes to ' + file);
    }
  }
}
