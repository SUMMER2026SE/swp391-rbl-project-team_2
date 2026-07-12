const fs = require('fs');
let content = fs.readFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', 'utf8');

content = content.split("t('properties.myProperties', 'My Properties')").join("t('landlord.properties.title', 'My Properties')");
content = content.split("t('properties.manageYourBuildingsHousesAnd', 'Manage your buildings, houses and their rooms')").join("t('landlord.properties.subtitle', 'Manage your buildings, houses and their rooms')");
content = content.split("t('properties.addNewProperty', 'Add New Property')").join("t('landlord.properties.addNewProperty', 'Add New Property')");
content = content.split("t('properties.total', 'Total')").join("t('landlord.properties.total', 'TOTAL')");
content = content.split("t('properties.available', 'Available')").join("t('landlord.properties.available', 'AVAILABLE')");
content = content.split("t('properties.rented', 'Rented')").join("t('landlord.properties.rented', 'RENTED')");
content = content.split("t('properties.occupancyRate', 'Occupancy Rate')").join("t('landlord.properties.occupancyRate', 'Occupancy Rate')");
content = content.split("t('properties.thng', '/ tháng')").join("t('landlord.properties.perMonth', '/ month')");
content = content.split("t('properties.dashboard', 'Dashboard')").join("t('landlord.properties.dashboardBtn', 'Dashboard')");

fs.writeFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', content);
console.log('Done replacing PropertiesPage.jsx keys');
