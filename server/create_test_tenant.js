const bcrypt = require('bcrypt');
const { sequelize, User, Role, defineAssociations } = require('./src/models');

async function createTestTenant() {
  try {
    defineAssociations();

    // Check if test tenant already exists
    const existing = await User.findOne({ where: { email: 'tenant_test@test.com' } });
    if (existing) {
      console.log('Test tenant already exists, updating password...');
      const hash = await bcrypt.hash('Test@123', 12);
      await existing.update({ password_hash: hash, is_active: true });
      console.log('✅ Password updated for tenant_test@test.com');
    } else {
      const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });
      const hash = await bcrypt.hash('Test@123', 12);
      await User.create({
        full_name: 'Test Tenant User',
        email: 'tenant_test@test.com',
        password_hash: hash,
        phone: '0999888777',
        role_id: tenantRole.role_id,
        is_active: true,
        is_banned: false,
        is_deleted: false,
      });
      console.log('✅ Created test tenant: tenant_test@test.com / Test@123');
    }

    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

createTestTenant();
