require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Role, sequelize } = require('./models');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find admin role
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    if (!adminRole) {
      console.log('Admin role not found. Make sure roles are seeded.');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@smartroom.com' } });
    if (existingAdmin) {
      console.log('Admin account already exists: admin@smartroom.com / Admin@123');
      process.exit(0);
    }

    // Create admin account
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    await User.create({
      full_name: 'System Administrator',
      email: 'admin@smartroom.com',
      password_hash: hashedPassword,
      role_id: adminRole.role_id,
      is_active: true, // Auto-verify
      is_banned: false,
    });

    console.log('✅ Admin account successfully created!');
    console.log('Email: admin@smartroom.com');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
};

seedAdmin();
