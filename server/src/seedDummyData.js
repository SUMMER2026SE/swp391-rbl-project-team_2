require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Role, Room, Payment, Complaint, sequelize } = require('./models');

const seedDummyData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Ensure Roles exist
    const landlordRole = await Role.findOne({ where: { role_name: 'Landlord' } });
    const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });

    if (!landlordRole || !tenantRole) {
      console.log('Roles not found. Please make sure roles are seeded.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 2. Create Dummy Landlord
    const [landlord] = await User.findOrCreate({
      where: { email: 'landlord@demo.com' },
      defaults: {
        full_name: 'Demo Landlord',
        password_hash: passwordHash,
        role_id: landlordRole.role_id,
        is_active: true,
        is_banned: false
      }
    });

    // 3. Create Dummy Tenant
    const [tenant] = await User.findOrCreate({
      where: { email: 'tenant@demo.com' },
      defaults: {
        full_name: 'Demo Tenant',
        password_hash: passwordHash,
        role_id: tenantRole.role_id,
        is_active: true,
        is_banned: false
      }
    });

    // 4. Create Dummy Rooms
    const roomsData = [
      {
        landlord_id: landlord.user_id,
        title: 'Luxury Studio in D1',
        description: 'A very nice studio.',
        address: '123 Nguyen Hue',
        city: 'Ho Chi Minh',
        district: 'District 1',
        price_per_month: 15000000,
        area_sqm: 35,
        room_type: 'single',
        max_occupants: 2,
        status: 'available',
        thumbnail_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        landlord_id: landlord.user_id,
        title: 'Cozy 2BR Apartment',
        description: 'Great for small families.',
        address: '456 Dien Bien Phu',
        city: 'Ho Chi Minh',
        district: 'Binh Thanh',
        price_per_month: 12000000,
        area_sqm: 60,
        room_type: 'double',
        max_occupants: 4,
        status: 'rented',
        thumbnail_url: 'https://images.unsplash.com/photo-1502672260266-1c1c29408447?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        landlord_id: landlord.user_id,
        title: 'Modern Room near University',
        description: 'Perfect for students.',
        address: '789 Nguyen Van Linh',
        city: 'Ho Chi Minh',
        district: 'District 7',
        price_per_month: 5000000,
        area_sqm: 20,
        room_type: 'shared',
        max_occupants: 1,
        status: 'available',
        thumbnail_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=200&h=200'
      }
    ];

    const createdRooms = [];
    for (const roomData of roomsData) {
      const [room] = await Room.findOrCreate({
        where: { title: roomData.title },
        defaults: roomData
      });
      createdRooms.push(room);
    }

    // 5. Create Dummy Contract
    const [contract] = await sequelize.models.Contract.findOrCreate({
      where: { room_id: createdRooms[1].room_id, tenant_id: tenant.user_id },
      defaults: {
        contract_number: `CTR-${Date.now()}`,
        landlord_id: landlord.user_id,
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        monthly_rent: 12000000,
        deposit_amount: 5000000,
        status: 'active'
      }
    });

    // 6. Create Dummy Payments
    await Payment.findOrCreate({
      where: { tenant_id: tenant.user_id, room_id: createdRooms[1].room_id, payment_type: 'rent' },
      defaults: {
        landlord_id: landlord.user_id,
        contract_id: contract.contract_id,
        amount: 12000000,
        status: 'completed',
        payment_method: 'bank_transfer',
        paid_date: new Date()
      }
    });

    await Payment.findOrCreate({
      where: { tenant_id: tenant.user_id, room_id: createdRooms[1].room_id, payment_type: 'deposit' }, // changed room_id to createdRooms[1] because it needs the contract
      defaults: {
        landlord_id: landlord.user_id,
        contract_id: contract.contract_id,
        amount: 5000000,
        status: 'pending',
        payment_method: 'cash'
      }
    });

    // 7. Create Dummy Complaint
    await Complaint.findOrCreate({
      where: { tenant_id: tenant.user_id, room_id: createdRooms[1].room_id },
      defaults: {
        title: 'AC is broken',
        landlord_id: landlord.user_id,
        description: 'The AC is broken and landlord is unresponsive.',
        status: 'pending'
      }
    });

    console.log('✅ Dummy data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    process.exit(1);
  }
};

seedDummyData();
