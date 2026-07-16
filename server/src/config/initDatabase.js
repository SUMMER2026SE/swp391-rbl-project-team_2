const sequelize = require('./database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Import all models (without associations being defined yet)
    const { Role, User, OtpVerification, Property, Room, RoomImage, Facility, RentalRequest, Payment, Contract, ViewingSchedule, Complaint, Conversation, Message, Notification, Booking, Favorite, UserBankDetail, WithdrawalRequest, defineAssociations } = require('../models');

    // Self-healing: Force the database back to MULTI_USER mode just in case it was stuck in SINGLE_USER mode
    try {
      await sequelize.query(`
        IF EXISTS (SELECT name FROM sys.databases WHERE name = N'RentalRoomSystem' AND user_access_desc = 'SINGLE_USER')
        BEGIN
            ALTER DATABASE RentalRoomSystem SET MULTI_USER WITH ROLLBACK IMMEDIATE;
        END
      `);
      console.log('✅ Checked and enforced MULTI_USER mode');
    } catch (err) {
      console.warn('⚠️ Could not check/set MULTI_USER mode (this is usually fine):', err.message);
    }

    // Manual migrations to ensure schema is correct before sync
    try {
      // Add missing identity verification columns to users table
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'cccd_front_url')
        BEGIN
            ALTER TABLE users ADD 
                cccd_front_url NVARCHAR(500) NULL,
                cccd_back_url NVARCHAR(500) NULL,
                face_photo_url NVARCHAR(500) NULL,
                verification_status VARCHAR(20) DEFAULT 'unverified',
                verification_notes NVARCHAR(1000) NULL;
        END
      `);

      // Add missing columns to rental_requests table
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rental_requests') AND name = 'tenant_phone')
        BEGIN
            ALTER TABLE rental_requests ADD 
                tenant_phone VARCHAR(20) NULL,
                rental_purpose NVARCHAR(500) NULL;
        END
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'properties')
        BEGIN
            CREATE TABLE properties (
                property_id INT IDENTITY PRIMARY KEY,
                landlord_id INT NOT NULL,
                name NVARCHAR(255) NOT NULL,
                description NVARCHAR(MAX) NULL,
                address NVARCHAR(500) NOT NULL,
                city NVARCHAR(100) NOT NULL,
                district NVARCHAR(100) NULL,
                ward NVARCHAR(100) NULL,
                latitude DECIMAL(10, 8) NULL,
                longitude DECIMAL(11, 8) NULL,
                total_floors INT DEFAULT 1,
                thumbnail_url NVARCHAR(500) NULL,
                status VARCHAR(15) DEFAULT 'active',
                is_deleted BIT DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (landlord_id) REFERENCES users(user_id)
            );
        END
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('properties') AND name = 'latitude')
        BEGIN
            ALTER TABLE properties ADD 
                latitude DECIMAL(10, 8) NULL,
                longitude DECIMAL(11, 8) NULL;
        END
      `);
      
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rooms') AND name = 'property_id')
        BEGIN
            ALTER TABLE rooms ADD property_id INT NULL;
            ALTER TABLE rooms ADD floor INT NULL;
            ALTER TABLE rooms ADD room_number VARCHAR(20) NULL;
            ALTER TABLE rooms ADD CONSTRAINT FK_rooms_properties FOREIGN KEY (property_id) REFERENCES properties(property_id);
        END
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rooms') AND name = 'latitude')
        BEGIN
            ALTER TABLE rooms ADD 
                latitude DECIMAL(10, 8) NULL,
                longitude DECIMAL(11, 8) NULL;
        END
      `);

      // Add tenant identity columns to contracts
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('contracts') AND name = 'tenant_name')
        BEGIN
            ALTER TABLE contracts ADD 
                tenant_name NVARCHAR(100) NULL,
                tenant_ic VARCHAR(20) NULL,
                tenant_ic_issue_date DATE NULL,
                tenant_ic_issue_place NVARCHAR(255) NULL,
                tenant_permanent_address NVARCHAR(255) NULL,
                landlord_name NVARCHAR(100) NULL,
                landlord_ic VARCHAR(20) NULL,
                landlord_ic_issue_date DATE NULL,
                landlord_ic_issue_place NVARCHAR(255) NULL,
                landlord_permanent_address NVARCHAR(255) NULL,
                landlord_signature NVARCHAR(MAX) NULL,
                tenant_signature NVARCHAR(MAX) NULL;
        END
      `);

      // Add tenant identity columns to rental_requests
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rental_requests') AND name = 'tenant_name')
        BEGIN
            ALTER TABLE rental_requests ADD 
                tenant_name NVARCHAR(100) NULL,
                tenant_ic VARCHAR(20) NULL,
                tenant_ic_issue_date DATE NULL,
                tenant_ic_issue_place NVARCHAR(255) NULL,
                tenant_permanent_address NVARCHAR(255) NULL;
        END
      `);

      // Add missing room columns
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('rooms') AND name = 'quantity')
        BEGIN
            ALTER TABLE rooms ADD quantity INT DEFAULT 1;
            ALTER TABLE rooms ADD available_quantity INT DEFAULT 1;
        END
      `);

      // Add missing contract columns
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('contracts') AND name = 'assigned_room_number')
        BEGIN
            ALTER TABLE contracts ADD assigned_room_number VARCHAR(50) NULL;
        END
      `);

      // Create user_bank_details table
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_bank_details')
        BEGIN
            CREATE TABLE user_bank_details (
                id INT IDENTITY PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                bank_name NVARCHAR(255) NOT NULL,
                account_number VARCHAR(50) NOT NULL,
                account_holder_name NVARCHAR(255) NOT NULL,
                branch NVARCHAR(255) NULL,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        END
      `);

      // Create withdrawal_requests table
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'withdrawal_requests')
        BEGIN
            CREATE TABLE withdrawal_requests (
                withdrawal_id INT IDENTITY PRIMARY KEY,
                user_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                bank_name NVARCHAR(255) NOT NULL,
                account_number VARCHAR(50) NOT NULL,
                account_holder_name NVARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                transaction_proof_url NVARCHAR(500) NULL,
                admin_notes NVARCHAR(MAX) NULL,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        END
      `);

      // Add withdrawal_id to payments table
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'withdrawal_id')
        BEGIN
            ALTER TABLE payments ADD withdrawal_id INT NULL;
            ALTER TABLE payments ADD CONSTRAINT FK_payments_withdrawal FOREIGN KEY (withdrawal_id) REFERENCES withdrawal_requests(withdrawal_id);
        END
      `);

      console.log('✅ Applied schema migrations');
    } catch (err) {
      console.warn('⚠️ Could not apply schema migrations:', err.message);
    }

    // Sync all tables at once
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ All database tables synced');

    // Now define associations after tables are created
    defineAssociations();
    console.log('✅ Associations defined');

    // Create default roles if they don't exist
    const roleCount = await Role.count();
    if (roleCount === 0) {
      await Role.bulkCreate([
        { role_name: 'Admin', description: 'Administrator' },
        { role_name: 'Landlord', description: 'Property Owner' },
        { role_name: 'Tenant', description: 'Renter' },
      ]);
      console.log('✅ Default roles created');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
};

module.exports = initDatabase;
