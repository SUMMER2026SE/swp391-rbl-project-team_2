const fs = require('fs');
let content = fs.readFileSync('client/src/features/landlord/pages/ManageListingsPage.jsx', 'utf8');

// Add import
content = content.replace(/import \{ useNavigate, useSearchParams \} from 'react-router-dom';/, "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';");

// Add hook
content = content.replace(/const ManageListingsPage = \(\) => \{/, "const ManageListingsPage = () => {\n  const { t } = useTranslation();");

// Replace texts
content = content.split("<h1>Manage Listings</h1>").join("<h1>{t('landlord.manageListings.title', 'Manage Listings')}</h1>");
content = content.split("<p>View, edit, and monitor your property portfolio.</p>").join("<p>{t('landlord.manageListings.subtitle', 'View, edit, and monitor your property portfolio.')}</p>");
content = content.split("placeholder=\"Search by address, ID, or title...\"").join("placeholder={t('landlord.manageListings.searchPlaceholder', 'Search by address, ID, or title...')}");
content = content.split("<span>All Statuses</span>").join("<span>{t('landlord.manageListings.allStatuses', 'All Statuses')}</span>");
content = content.split("<span>More Filters</span>").join("<span>{t('landlord.manageListings.moreFilters', 'More Filters')}</span>");
content = content.split("<span>Add New Listing</span>").join("<span>{t('landlord.manageListings.addNewListing', 'Add New Listing')}</span>");
content = content.split("<span>{propertyRooms.length} rooms</span>").join("<span>{t('landlord.manageListings.roomsCount', '{{count}} rooms', { count: propertyRooms.length })}</span>");
content = content.split("<span>{listing.status}</span>").join("<span>{t(`landlord.manageListings.statuses.${listing.status.toLowerCase()}`, listing.status)}</span>");
content = content.split("<span>View Room Listing</span>").join("<span>{t('landlord.manageListings.viewRoomListing', 'View Room Listing')}</span>");
content = content.split("<span className=\"price-unit\">/tháng</span>").join("<span className=\"price-unit\">{t('landlord.manageListings.perMonth', '/tháng')}</span>");

fs.writeFileSync('client/src/features/landlord/pages/ManageListingsPage.jsx', content);
console.log('Done replacing ManageListingsPage.jsx keys');
