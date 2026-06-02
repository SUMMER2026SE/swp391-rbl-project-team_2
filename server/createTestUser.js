const bcrypt = require('bcrypt');
const { User, Role } = require('./src/models');
require('dotenv').config();

const createTestUser = async () => {
  try {
    console.log('🔄 Creating test user...');

    // Find Tenant role
    const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });
    if (!tenantRole) {
      console.error('❌ Tenant role not found');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create test user
    const testUser = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      password_hash: hashedPassword,
      role_id: tenantRole.role_id,
      is_active: true, // Already verified
      is_banned: false,
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: 123456');
    console.log('👤 User ID:', testUser.user_id);

    // Also create a landlord test user
    const landlordRole = await Role.findOne({ where: { role_name: 'Landlord' } });
    const landlordUser = await User.create({
      full_name: 'Test Landlord',
      email: 'landlord@example.com',
      phone: '0987654321',
      password_hash: hashedPassword,
      role_id: landlordRole.role_id,
      is_active: true,
      is_banned: false,
    });

    console.log('\n✅ Landlord test user created successfully!');
    console.log('📧 Email: landlord@example.com');
    console.log('🔑 Password: 123456');
    console.log('👤 User ID:', landlordUser.user_id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    console.error('Full error:', error);
    process.exit(1);
  }
};

createTestUser();
