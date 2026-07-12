const fs = require('fs');
let content = fs.readFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', 'utf8');

if (!content.includes('useTranslation')) {
    content = content.replace(/import \{ useNavigate \} from 'react-router-dom';/, "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';");
    content = content.replace(/const PropertiesPage = \(\) => \{/, "const PropertiesPage = () => {\n  const { t } = useTranslation();");
}

content = content.split("<h1>My Properties</h1>").join("<h1>{t('landlord.properties.title', 'My Properties')}</h1>");
content = content.split("<p>Manage your buildings, houses and their rooms</p>").join("<p>{t('landlord.properties.subtitle', 'Manage your buildings, houses and their rooms')}</p>");
content = content.split("<span>Add New Property</span>").join("<span>{t('landlord.properties.addNewProperty', 'Add New Property')}</span>");
content = content.split("<h3>No Properties Yet</h3>").join("<h3>{t('landlord.properties.empty.title', 'No Properties Yet')}</h3>");
content = content.split("<p>Create your first property to start managing your rooms by building, floor, and unit.</p>").join("<p>{t('landlord.properties.empty.subtitle', 'Create your first property to start managing your rooms by building, floor, and unit.')}</p>");
content = content.split("<span>Add Your First Property</span>").join("<span>{t('landlord.properties.empty.btn', 'Add Your First Property')}</span>");
content = content.split('<div className="property-stat-label">Total</div>').join('<div className="property-stat-label">{t("landlord.properties.total", "TOTAL")}</div>');
content = content.split('<div className="property-stat-label">Available</div>').join('<div className="property-stat-label">{t("landlord.properties.available", "AVAILABLE")}</div>');
content = content.split('<div className="property-stat-label">Rented</div>').join('<div className="property-stat-label">{t("landlord.properties.rented", "RENTED")}</div>');
content = content.split("<span>Occupancy Rate</span>").join("<span>{t('landlord.properties.occupancyRate', 'Occupancy Rate')}</span>");
content = content.split('<span className="property-price-unit">/ month</span>').join('<span className="property-price-unit">{t("landlord.properties.perMonth", "/ month")}</span>');
content = content.split("<span>Dashboard</span>").join("<span>{t('landlord.properties.dashboardBtn', 'Dashboard')}</span>");

fs.writeFileSync('client/src/features/landlord/pages/PropertiesPage.jsx', content);
console.log('Done fixing PropertiesPage.jsx keys');
