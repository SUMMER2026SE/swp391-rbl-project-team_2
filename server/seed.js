const { sequelize } = require('./src/models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting native SQL database seeding...');

    // Synchronize structure first to ensure tables exist
    await sequelize.sync({ force: false });
    console.log('✅ Schema structure verified');

    // ----------------------------------------------------
    // 1. Safe data purging query
    // ----------------------------------------------------
    console.log('Purging old records...');
    await sequelize.query(`
      -- Tắt kiểm tra khóa ngoại tạm thời
      EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";

      -- Xóa tất cả các bảng giao dịch
      DELETE FROM [notifications];
      DELETE FROM [complaints];
      DELETE FROM [viewing_schedules];
      DELETE FROM [payments];
      DELETE FROM [contracts];
      DELETE FROM [rental_requests];
      DELETE FROM [room_images];
      DELETE FROM [facilities];
      DELETE FROM [messages];
      DELETE FROM [conversations];
      DELETE FROM [rooms];
      DELETE FROM [users];
      DELETE FROM [roles];

      -- Bật lại kiểm tra khóa ngoại
      EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
    `);
    console.log('✅ Database purged clean');

    // ----------------------------------------------------
    // 2. Reset Identites (IDENTITY_INSERT keys)
    // ----------------------------------------------------
    console.log('Resetting identity generators...');
    await sequelize.query('DBCC CHECKIDENT (\'rooms\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT (\'users\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT (\'roles\', RESEED, 0)');
    console.log('✅ Identity generators resetted');

    // ----------------------------------------------------
    // 3. Seed Roles (IDENTITY_INSERT)
    // ----------------------------------------------------
    console.log('🎭 Seeding user roles...');
    await sequelize.query(`
      SET IDENTITY_INSERT [roles] ON;
      INSERT INTO [roles] ([role_id], [role_name], [description]) VALUES
      (1, 'Admin', 'System Administrator with full access keys'),
      (2, 'Landlord', 'Property Owner who manages boarding houses & listings'),
      (3, 'Tenant', 'Renters who search rooms, sign contracts, and send requests');
      SET IDENTITY_INSERT [roles] OFF;
    `);
    console.log('✅ Roles seeded');

    // ----------------------------------------------------
    // 4. Seed Users (Mật khẩu mặc định: 123456)
    // ----------------------------------------------------
    console.log('👤 Seeding users (1 Landlord + 3 Tenants)...');
    await sequelize.query(`
      SET IDENTITY_INSERT [users] ON;
      INSERT INTO [users] 
      (
          [user_id], [full_name], [email], [password_hash], [phone], 
          [role_id], [avatar_url], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]
      ) 
      VALUES
      (
          2, N'Test Landlord', 'landlord@example.com', 
          '$2b$12$sR.yPpeBfX20yI7pZqZtDe4YxRj8p8aK1XgN.pB.U0Pz7d4C0QxR2', 
          '0987654321', 2, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
          1, 0, 0, GETDATE(), GETDATE()
      ),
      (
          3, N'Sarah Jenkins', 'test@example.com', 
          '$2b$12$sR.yPpeBfX20yI7pZqZtDe4YxRj8p8aK1XgN.pB.U0Pz7d4C0QxR2', 
          '0123456789', 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
          1, 0, 0, GETDATE(), GETDATE()
      ),
      (
          4, N'Marcus Thorne', 'tenant2@example.com', 
          '$2b$12$sR.yPpeBfX20yI7pZqZtDe4YxRj8p8aK1XgN.pB.U0Pz7d4C0QxR2', 
          '0345678901', 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
          1, 0, 0, GETDATE(), GETDATE()
      ),
      (
          5, N'Emily Chen', 'tenant3@example.com', 
          '$2b$12$sR.yPpeBfX20yI7pZqZtDe4YxRj8p8aK1XgN.pB.U0Pz7d4C0QxR2', 
          '0909123456', 3, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
          1, 0, 0, GETDATE(), GETDATE()
      );
      SET IDENTITY_INSERT [users] OFF;
    `);
    console.log('✅ Users seeded');

    // ----------------------------------------------------
    // 5. Seed Rooms (Listings)
    // ----------------------------------------------------
    console.log('🏠 Seeding landlord room listings...');
    await sequelize.query(`
      SET IDENTITY_INSERT [rooms] ON;
      INSERT INTO [rooms]
      (
          [room_id], [landlord_id], [title], [description], [address], [city], 
          [district], [ward], [price_per_month], [area_sqm], [room_type], 
          [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at]
      )
      VALUES
      (
          1, 2, N'Premium Studio Suite Near Tech Park', 
          N'A gorgeous fully furnished studio apartment featuring modern amenities, glass window walls, dedicated laundry room, high-speed fiber internet, and premium security systems.',
          N'128 Vo Van Ngan Street, Binh Tho Ward', N'Ho Chi Minh City', N'Thu Duc District', N'Binh Tho Ward',
          450.00, 32.50, 'single', 2, 'available',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&h=400&q=80',
          0, GETDATE(), GETDATE()
      ),
      (
          2, 2, N'Luxury Double Room with Panoramic City View', 
          N'Spacious luxury double-bed unit equipped with a kitchen, refrigerator, custom oak wood wardrobe, large balcony, private smart bathroom, and separate power meter.',
          N'45 Nguyen Hue Boulevard, Ben Nghe Ward', N'Ho Chi Minh City', N'District 1', N'Ben Nghe Ward',
          750.00, 48.00, 'double', 3, 'available',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=400&q=80',
          0, GETDATE(), GETDATE()
      ),
      (
          3, 2, N'Cozy Shared Apartment for Students & Interns', 
          N'Comfortable shared room package. Rent includes all utilities: electricity, clean drinking water, hot shower, high-speed Wi-Fi, and weekly housekeeping services.',
          N'12/4 Duong Dinh Hoi, Tang Nhon Phu B Ward', N'Ho Chi Minh City', N'District 9', N'Tang Nhon Phu B Ward',
          250.00, 24.00, 'shared', 2, 'rented',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&h=400&q=80',
          0, GETDATE(), GETDATE()
      ),
      (
          4, 2, N'Modern Minimalist Room - Renovations Underway', 
          N'Minimalist style apartment with modern light fixtures. Room is currently undergoing minor wall repainting and light fixtures upgrades. Available for move-in next week.',
          N'88 Le Van Viet Street, Hiep Phu Ward', N'Ho Chi Minh City', N'District 9', N'Hiep Phu Ward',
          320.00, 28.00, 'single', 1, 'maintenance',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&h=400&q=80',
          0, GETDATE(), GETDATE()
      );
      SET IDENTITY_INSERT [rooms] OFF;
    `);
    console.log('✅ Room listings seeded');

    // ----------------------------------------------------
    // 6. Seed Facilities (Amenities)
    // ----------------------------------------------------
    console.log('📺 Seeding facilities...');
    await sequelize.query(`
      SET IDENTITY_INSERT [facilities] ON;
      INSERT INTO [facilities] ([facility_id], [room_id], [facility_name], [facility_type]) VALUES
      (1, 1, 'High-Speed Wi-Fi', 'utility'),
      (2, 1, 'Air Conditioning', 'appliance'),
      (3, 1, 'Smart Lock Door', 'security'),
      (4, 1, 'Washing Machine', 'appliance'),
      (5, 2, 'Kitchenette & Fridge', 'appliance'),
      (6, 2, 'Private Balcony', 'other'),
      (7, 2, 'Smart TV', 'entertainment'),
      (8, 3, 'Shared Refrigerator', 'appliance'),
      (9, 3, 'Bunk Bed & Desks', 'furniture');
      SET IDENTITY_INSERT [facilities] OFF;
    `);
    console.log('✅ Facilities seeded');

    // ----------------------------------------------------
    // 7. Seed Rental Requests (Bookings)
    // ----------------------------------------------------
    console.log('📋 Seeding rental requests (bookings)...');
    await sequelize.query(`
      SET IDENTITY_INSERT [rental_requests] ON;
      INSERT INTO [rental_requests]
      (
          [request_id], [tenant_id], [landlord_id], [room_id], [status], 
          [requested_move_in_date], [lease_duration_months], [message], [created_at], [updated_at]
      )
      VALUES
      (
          1, 3, 2, 1, 'pending', 
          DATEADD(day, 5, GETDATE()), 12, 
          N'Hi Landlord! I am a software engineer starting a new job next Monday. Your studio apartment looks fantastic. I would love to check it out and hopefully move in.', 
          DATEADD(hour, -2, GETDATE()), DATEADD(hour, -2, GETDATE())
      ),
      (
          2, 4, 2, 2, 'approved', 
          DATEADD(day, 2, GETDATE()), 6, 
          N'Hello, I would like to book a tour of the Luxury Double Room this Wednesday. My budget is comfortable and I am looking for a quiet workspace. Thank you!', 
          DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE())
      ),
      (
          3, 5, 2, 3, 'rejected', 
          DATEADD(day, 1, GETDATE()), 3, 
          N'Hi. I want to rent the shared apartment for only 1 month while doing my summer internship. Hope that is okay.', 
          DATEADD(day, -4, GETDATE()), DATEADD(day, -3, GETDATE())
      );
      SET IDENTITY_INSERT [rental_requests] OFF;
    `);
    console.log('✅ Rental requests seeded');

    // ----------------------------------------------------
    // 8. Seed Conversations & Messages
    // ----------------------------------------------------
    console.log('💬 Seeding conversations and chats...');
    await sequelize.query(`
      SET IDENTITY_INSERT [conversations] ON;
      INSERT INTO [conversations]
      (
          [conversation_id], [room_id], [participant_1_id], [participant_2_id], 
          [last_message], [last_message_at], [is_active], [created_at], [updated_at]
      )
      VALUES
      (
          1, 1, 3, 2, 
          N'Okay, great! I will see you on Friday at 2:00 PM.', 
          GETDATE(), 1, GETDATE(), GETDATE()
      ),
      (
          2, 2, 4, 2, 
          N'Let me double-check the utility breakdown and get back to you soon.', 
          DATEADD(hour, -1, GETDATE()), 1, GETDATE(), GETDATE()
      );
      SET IDENTITY_INSERT [conversations] OFF;
    `);
    console.log('✅ Conversations seeded');

    console.log('📨 Seeding messages...');
    await sequelize.query(`
      SET IDENTITY_INSERT [messages] ON;
      INSERT INTO [messages] ([message_id], [conversation_id], [sender_id], [content], [is_read], [read_at], [created_at]) VALUES
      (1, 1, 3, N'Hi Landlord! I just sent a rental application for the Premium Studio Suite. Is it still available?', 1, GETDATE(), DATEADD(minute, -30, GETDATE())),
      (2, 1, 2, N'Hello Sarah! Yes, the Premium Studio is absolutely available and ready for occupancy.', 1, GETDATE(), DATEADD(minute, -25, GETDATE())),
      (3, 1, 3, N'That is wonderful news! Does the rent price include water and parking fees?', 1, GETDATE(), DATEADD(minute, -20, GETDATE())),
      (4, 1, 2, N'The rent includes water and 1 high-security parking slot inside the basement. Electricity is metered separately.', 1, GETDATE(), DATEADD(minute, -15, GETDATE())),
      (5, 1, 3, N'Awesome! Can we schedule a viewing tour this Friday afternoon?', 1, GETDATE(), DATEADD(minute, -10, GETDATE())),
      (6, 1, 2, N'Certainly. I have an opening between 2:00 PM and 4:00 PM. Does 2:00 PM work for you?', 1, GETDATE(), DATEADD(minute, -8, GETDATE())),
      (7, 1, 3, N'Perfect! 2:00 PM works great for me. I will see you at the lobby.', 1, GETDATE(), DATEADD(minute, -5, GETDATE())),
      (8, 1, 2, N'Okay, great! I will see you on Friday at 2:00 PM.', 0, NULL, GETDATE()),
      
      (9, 2, 4, N'Hello, I am interested in the Luxury Double Room. Can you tell me if the internet is stable?', 1, GETDATE(), DATEADD(hour, -3, GETDATE())),
      (10, 2, 2, N'Hi Marcus. We have a dedicated fiber-optic business line with separate APs for each room, extremely stable.', 1, GETDATE(), DATEADD(hour, -2, GETDATE())),
      (11, 2, 4, N'That is perfect for remote work. Are utilities calculated as flat rates or actual usage?', 1, GETDATE(), DATEADD(hour, -2, GETDATE())),
      (12, 2, 2, N'Electricity is $0.15 per kWh based on your private sub-meter. Water is a flat rate of $10 per person monthly.', 1, GETDATE(), DATEADD(hour, -1, GETDATE())),
      (13, 2, 4, N'Let me double-check the utility breakdown and get back to you soon.', 0, NULL, DATEADD(hour, -1, GETDATE()));
      SET IDENTITY_INSERT [messages] OFF;
    `);
    console.log('✅ Messages seeded');

    // ----------------------------------------------------
    // 9. Seed Contracts & Payments
    // ----------------------------------------------------
    console.log('📊 Seeding contracts & payments for dashboard statistics...');
    await sequelize.query(`
      SET IDENTITY_INSERT [contracts] ON;
      INSERT INTO [contracts]
      (
          [contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], 
          [end_date], [monthly_rent], [deposit_amount], [status], [created_at], [updated_at]
      )
      VALUES
      (
          1, 3, 4, 2, 'CON-2026-0001', DATEADD(month, -2, GETDATE()), 
          DATEADD(month, 4, GETDATE()), 250.00, 250.00, 'active', GETDATE(), GETDATE()
      );
      SET IDENTITY_INSERT [contracts] OFF;

      SET IDENTITY_INSERT [payments] ON;
      INSERT INTO [payments]
      (
          [payment_id], [contract_id], [room_id], [tenant_id], [landlord_id], 
          [amount], [payment_type], [payment_method], [status], [due_date], [paid_date], [created_at], [updated_at]
      )
      VALUES
      (
          1, 1, 3, 4, 2, 250.00, 'rent', 'bank_transfer', 'completed', 
          DATEADD(month, -1, GETDATE()), DATEADD(month, -1, GETDATE()), GETDATE(), GETDATE()
      ),
      (
          2, 1, 3, 4, 2, 250.00, 'rent', 'bank_transfer', 'completed', 
          GETDATE(), GETDATE(), GETDATE(), GETDATE()
      );
      SET IDENTITY_INSERT [payments] OFF;
    `);
    console.log('✅ Contracts & payments seeded');

    console.log('🎉 SUCCESS: Database fully seeded and ready for production!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database natively:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
