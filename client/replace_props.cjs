const fs = require('fs');
let content = fs.readFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', 'utf8');

content = content.replace(/t\('properties\.myProperties', 'My Properties'\)/g, "t('landlord.properties.title', 'My Properties')");
content = content.replace(/t\('properties\.manageYourBuildingsHousesAnd', 'Manage your buildings, houses and their rooms'\)/g, "t('landlord.properties.subtitle', 'Manage your buildings, houses and their rooms')");
content = content.replace(/t\('properties\.addNewProperty', 'Add New Property'\)/g, "t('landlord.properties.addNewProperty', 'Add New Property')");
content = content.replace(/t\('properties\.total', 'Total'\)/g, "t('landlord.properties.total', 'TOTAL')");
content = content.replace(/t\('properties\.available', 'Available'\)/g, "t('landlord.properties.available', 'AVAILABLE')");
content = content.replace(/t\('properties\.rented', 'Rented'\)/g, "t('landlord.properties.rented', 'RENTED')");
content = content.replace(/t\('properties\.occupancyRate', 'Occupancy Rate'\)/g, "t('landlord.properties.occupancyRate', 'Occupancy Rate')");
content = content.replace(/t\('properties\.thng', '\/ tháng'\)/g, "t('landlord.properties.perMonth', '/ month')");
content = content.replace(/t\('properties\.dashboard', 'Dashboard'\)/g, "t('landlord.properties.dashboardBtn', 'Dashboard')");

fs.writeFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', content);
console.log('Done replacing PropertiesPage.jsx keys');
