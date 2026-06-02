const { sequelize, User, Role } = require('./src/models');
require('dotenv').config();

const testSequelize = async () => {
  try {
    console.log('🧪 Testing Sequelize...');

    // Test 1: Find one user
    console.log('\n1️⃣ Testing User.findOne()...');
    const user = await User.findOne({ where: { email: 'nonexistent@example.com' } });
    console.log('✅ Result:', user);

    // Test 2: Find all users
    console.log('\n2️⃣ Testing User.findAll()...');
    const users = await User.findAll();
    console.log('✅ Result count:', users.length);

    // Test 3: Create user
    console.log('\n3️⃣ Testing User.create()...');
    const newUser = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hash123',
      role_id: 3,
      is_active: false,
      is_banned: false,
    });
    console.log('✅ Created user:', newUser.user_id);

    // Test 4: Find the created user
    console.log('\n4️⃣ Testing User.findOne() with created user...');
    const foundUser = await User.findOne({ where: { email: 'test@example.com' } });
    console.log('✅ Found user:', foundUser.email);

    // Test 5: Delete the user
    console.log('\n5️⃣ Testing User.destroy()...');
    await User.destroy({ where: { email: 'test@example.com' } });
    console.log('✅ User deleted');

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testSequelize();
