const sequelize = require('./database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Import all models (without associations being defined yet)
    const { Role, User, OtpVerification, Room, RoomImage, Facility, RentalRequest, Payment, Contract, ViewingSchedule, Complaint, Conversation, Message, Notification, Booking, Favorite, defineAssociations } = require('../models');

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
