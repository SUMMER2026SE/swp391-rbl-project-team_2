require('dotenv').config();
const { Sequelize } = require('sequelize');
const { User, Role, Room, sequelize } = require('./models');

const seedData = async () => {
  try {
    // Force sync the new database schema
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // Copy roles
    await sequelize.query(`
      SET IDENTITY_INSERT RentalRoomSystem_Test2.dbo.roles ON;
      INSERT INTO RentalRoomSystem_Test2.dbo.roles (role_id, role_name, description)
      SELECT role_id, role_name, description FROM RentalRoomSystem_Test.dbo.roles;
      SET IDENTITY_INSERT RentalRoomSystem_Test2.dbo.roles OFF;
    `);
    console.log('Roles copied.');

    // Copy users
    await sequelize.query(`
      SET IDENTITY_INSERT RentalRoomSystem_Test2.dbo.users ON;
      INSERT INTO RentalRoomSystem_Test2.dbo.users (user_id, full_name, email, password_hash, phone, role_id, avatar_url, google_id, is_active, is_banned, is_deleted, created_at, updated_at)
      SELECT user_id, full_name, email, password_hash, phone, role_id, avatar_url, google_id, is_active, is_banned, is_deleted, created_at, updated_at FROM RentalRoomSystem_Test.dbo.users;
      SET IDENTITY_INSERT RentalRoomSystem_Test2.dbo.users OFF;
    `);
    console.log('Users copied.');

    // Get a landlord
    const landlordRole = await Role.findOne({ where: { role_name: 'Landlord' } });
    if (!landlordRole) throw new Error('Landlord role not found.');
    const landlord = await User.findOne({ where: { role_id: landlordRole.role_id } });
    if (!landlord) throw new Error('No landlord user found.');

    console.log(`Creating 20 rooms for landlord: ${landlord.full_name} (${landlord.email})`);

    const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Bình Thạnh', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức', 'Gò Vấp', 'Quận 10'];
    const types = ['single', 'double', 'shared', 'studio', 'apartment'];
    const statuses = ['available', 'available', 'available', 'available', 'rented', 'maintenance', 'pending'];
    const thumbnails = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1502672260266-1c1c29408447?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1598928506311-c55dd18eb64b?auto=format&fit=crop&q=80&w=200&h=200'
    ];

    const roomsToInsert = [];
    for (let i = 1; i <= 20; i++) {
      roomsToInsert.push({
        landlord_id: landlord.user_id,
        title: `Phòng trọ cao cấp số ${i}`,
        description: `Đây là phòng trọ cao cấp số ${i}, đầy đủ tiện nghi, thoáng mát, khu dân cư an ninh. Phù hợp cho sinh viên và người đi làm.`,
        address: `${i * 10} Đường ABC`,
        ward: 'Phường 1',
        district: districts[i % districts.length],
        city: 'Hồ Chí Minh',
        price_per_month: 3000000 + (Math.floor(Math.random() * 5) * 500000),
        area_sqm: 20 + Math.floor(Math.random() * 15),
        room_type: types[i % types.length],
        bedrooms: 1 + Math.floor(Math.random() * 2),
        max_occupants: 2 + Math.floor(Math.random() * 3),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        thumbnail_url: thumbnails[i % thumbnails.length]
      });
    }

    await Room.bulkCreate(roomsToInsert);
    console.log('20 dummy rooms inserted successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedData();
