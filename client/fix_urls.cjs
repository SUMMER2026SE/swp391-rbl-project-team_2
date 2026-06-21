const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace `http://localhost:5000${room.thumbnail_url}`
  content = content.replace(/`http:\/\/localhost:5000\$\{([^}]+)\}`/g, "($1 && $1.startsWith('http') ? $1 : `http://localhost:5000${$1}`)");
  
  // Replace "http://localhost:5000" + room.thumbnailUrl
  content = content.replace(/"http:\/\/localhost:5000"\s*\+\s*([a-zA-Z0-9_.[\]]+)/g, "($1 && $1.startsWith('http') ? $1 : `http://localhost:5000${$1}`)");

  fs.writeFileSync(filePath, content, 'utf8');
}

const filesToFix = [
  'src/features/tenant/pages/FavoritesPage.jsx',
  'src/features/tenant/pages/RentalRequestPage.jsx',
  'src/features/tenant/pages/SearchPage.jsx',
  'src/features/tenant/pages/TenantRequestsPage.jsx',
  'src/features/tenant/pages/ListingsPage.jsx',
  'src/features/tenant/pages/DepositPaymentPage.jsx',
  'src/pages/HomePage.jsx',
  'src/features/tenant/components/RoomCard.jsx' // just in case
];

filesToFix.forEach(f => replaceInFile(path.join(__dirname, f)));
console.log('Fixed URLs');
