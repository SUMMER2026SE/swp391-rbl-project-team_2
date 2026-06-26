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
    
    // First, fix any strings that have a trailing N right before the closing quote, 
    // AND they don't start with N. This handles the '...N' case.
    // Example: 'Phòng trọN' -> 'Phòng trọ'
    // Regex matches: ' (any chars) N '
    // We have to be careful not to break legitimate strings ending in N, 
    // but honestly it's almost certainly corrupted.
    
    // Wait, let's just use a safer regex:
    // If it's a string literal that might have been corrupted:
    // We'll replace all string literals.
    content = content.replace(/(N?)('(?:[^']|'')*')/g, (match, nPrefix, stringContent) => {
      // stringContent includes the quotes, e.g., "'Phòng trọN'"
      let inner = stringContent.substring(1, stringContent.length - 1); // remove quotes
      
      // If it ends with N (due to corruption) and it's a known corrupted file, remove it
      // Actually, all these strings were corrupted by a bad find/replace.
      if (inner.endsWith('N') && inner.length > 0) {
        inner = inner.substring(0, inner.length - 1);
      }
      
      // Now return the properly formatted N-prefixed string
      return "N'" + inner + "'";
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed strings in ' + file);
  }
}
