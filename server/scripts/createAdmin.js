const sequelize = require('../src/config/database');
const { User, Role } = require('../src/models');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    // Authenticate database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find the Admin role
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    if (!adminRole) {
      console.log('Admin role not found. Please ensure roles are seeded.');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@rental.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create user
    await User.create({
      full_name: 'System Admin',
      email: 'admin@rental.com',
      password_hash: passwordHash,
      phone: '1234567890',
      role_id: adminRole.role_id,
      is_active: true,
      is_banned: false,
    });

    console.log('Admin account created successfully:');
    console.log('Email: admin@rental.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
