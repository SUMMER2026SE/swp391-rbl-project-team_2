const fs = require('fs');
let content = fs.readFileSync('src/routes/AppRoutes.jsx', 'utf8');

// Ensure the two new imports are there
if (!content.includes('TenantDashboardPage')) {
  content = content.replace('TenantProfilePage,', 'TenantProfilePage,\n  TenantSettingsPage,\n  TenantDashboardPage,');
}

const mainLayoutRegex = /<Route element=\{<MainLayout \/>\}>[\s\S]*?<\/Route>/;

const newMainLayoutBlock = `      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ROOMS} element={<SearchPage />} />
        <Route path="/listings" element={<TenantListingsPage />} />
        <Route path="/listings/:id" element={<RoomDetailPage />} />
        <Route path={ROUTES.ROOM_DETAIL} element={<RoomDetailPage />} />
        <Route path={ROUTES.TENANT.CHAT} element={<AIChatPage />} />
        <Route path={ROUTES.TENANT.RENTAL_REQUEST} element={<RentalRequestPage />} />
        <Route path={ROUTES.HELP} element={<HelpCenterPage />} />
        
        {/* Tenant Portal Routes */}
        <Route path={ROUTES.TENANT.DASHBOARD} element={<TenantDashboardPage />} />
        <Route path={ROUTES.TENANT.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.TENANT.NOTIFICATIONS} element={<TenantNotificationsPage />} />
        <Route path="/tenant/requests" element={<TenantRequestsPage />} />
        <Route path={ROUTES.TENANT.DEPOSIT_HISTORY} element={<DepositHistoryPage />} />
        <Route path={ROUTES.TENANT.PROFILE} element={<TenantProfilePage />} />
        <Route path={ROUTES.TENANT.SETTINGS} element={<TenantSettingsPage />} />
        <Route path={ROUTES.TENANT.CHAT_LANDLORD} element={<MessagesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Route>`;

content = content.replace(mainLayoutRegex, newMainLayoutBlock);

// Remove any remaining tenant routes from the AdminLayout block to avoid duplicates
const adminLayoutRegex = /<Route element=\{<AdminLayout \/>\}>([\s\S]*?)<\/Route>/;
const match = content.match(adminLayoutRegex);
if (match) {
  let adminBlock = match[1];
  
  // Array of paths to remove from AdminLayout block
  const pathsToRemove = [
    'ROUTES.TENANT.DASHBOARD',
    'ROUTES.TENANT.FAVORITES',
    'ROUTES.TENANT.CHAT',
    'ROUTES.TENANT.NOTIFICATIONS',
    '"/tenant/requests"',
    'ROUTES.TENANT.RENTAL_REQUEST',
    'ROUTES.TENANT.DEPOSIT_HISTORY',
    'ROUTES.TENANT.PROFILE',
    'ROUTES.TENANT.SETTINGS',
    'ROUTES.TENANT.CHAT_LANDLORD',
    '"/messages"'
  ];
  
  const adminLines = adminBlock.split('\n');
  const newAdminLines = adminLines.filter(line => {
    return !pathsToRemove.some(path => line.includes(path));
  });
  
  const newAdminBlock = `<Route element={<AdminLayout />}>\n${newAdminLines.join('\n')}\n      </Route>`;
  content = content.replace(adminLayoutRegex, newAdminBlock);
}

fs.writeFileSync('src/routes/AppRoutes.jsx', content);
console.log('Successfully updated AppRoutes.jsx');
