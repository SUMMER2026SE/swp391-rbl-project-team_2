const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const OtpVerification = require('./OtpVerification');
const Room = require('./Room');
const RoomImage = require('./RoomImage');
const Facility = require('./Facility');
const RoomFacility = require('./RoomFacility');
const RentalRequest = require('./RentalRequest');
const Payment = require('./Payment');
const Contract = require('./Contract');
const ViewingSchedule = require('./ViewingSchedule');
const Complaint = require('./Complaint');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Notification = require('./Notification');
const Booking = require('./Booking');
const Favorite = require('./Favorite');

// =========================================================
// ASSOCIATIONS - Only define if not already defined
// =========================================================

const defineAssociations = () => {
  // Role <-> User
  if (!Role.hasMany.called) {
    Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  }

  // User <-> OtpVerification
  User.hasMany(OtpVerification, { foreignKey: 'user_id', as: 'otps' });
  OtpVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Room (Landlord)
  User.hasMany(Room, { foreignKey: 'landlord_id', as: 'rooms' });
  Room.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

  // Room <-> RoomImage
  Room.hasMany(RoomImage, { foreignKey: 'room_id', as: 'images' });
  RoomImage.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // Room <-> Facility (Many-to-Many)
  Room.belongsToMany(Facility, { through: RoomFacility, foreignKey: 'room_id', otherKey: 'facility_id', as: 'facilities' });
  Facility.belongsToMany(Room, { through: RoomFacility, foreignKey: 'facility_id', otherKey: 'room_id', as: 'rooms' });

  // Room <-> RentalRequest
  Room.hasMany(RentalRequest, { foreignKey: 'room_id', as: 'rentalRequests' });
  RentalRequest.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // User <-> RentalRequest (Tenant)
  User.hasMany(RentalRequest, { foreignKey: 'tenant_id', as: 'rentalRequestsAsTenant' });
  RentalRequest.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // User <-> RentalRequest (Landlord)
  User.hasMany(RentalRequest, { foreignKey: 'landlord_id', as: 'rentalRequestsAsLandlord' });
  RentalRequest.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordRequest' });

  // Contract <-> Room
  Room.hasMany(Contract, { foreignKey: 'room_id', as: 'contracts' });
  Contract.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // Booking <-> Room
  Room.hasMany(Booking, { foreignKey: 'listing_id', as: 'bookings' });
  Booking.belongsTo(Room, { foreignKey: 'listing_id', as: 'room' });

  // Booking <-> User (Tenant)
  User.hasMany(Booking, { foreignKey: 'tenant_id', as: 'bookingsAsTenant' });
  Booking.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // Booking <-> User (Landlord)
  User.hasMany(Booking, { foreignKey: 'landlord_id', as: 'bookingsAsLandlord' });
  Booking.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordBooking' });

  // Contract <-> User (Tenant)
  User.hasMany(Contract, { foreignKey: 'tenant_id', as: 'contractsAsTenant' });
  Contract.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // Contract <-> User (Landlord)
  User.hasMany(Contract, { foreignKey: 'landlord_id', as: 'contractsAsLandlord' });
  Contract.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordContract' });

  // Payment <-> Contract
  Contract.hasMany(Payment, { foreignKey: 'contract_id', as: 'payments' });
  Payment.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });

  // Payment <-> Room
  Room.hasMany(Payment, { foreignKey: 'room_id', as: 'payments' });
  Payment.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // Payment <-> User (Tenant)
  User.hasMany(Payment, { foreignKey: 'tenant_id', as: 'paymentsAsTenant' });
  Payment.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // Payment <-> User (Landlord)
  User.hasMany(Payment, { foreignKey: 'landlord_id', as: 'paymentsAsLandlord' });
  Payment.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordPayment' });

  // ViewingSchedule <-> Room
  Room.hasMany(ViewingSchedule, { foreignKey: 'room_id', as: 'viewingSchedules' });
  ViewingSchedule.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // ViewingSchedule <-> User (Tenant)
  User.hasMany(ViewingSchedule, { foreignKey: 'tenant_id', as: 'viewingSchedulesAsTenant' });
  ViewingSchedule.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // ViewingSchedule <-> User (Landlord)
  User.hasMany(ViewingSchedule, { foreignKey: 'landlord_id', as: 'viewingSchedulesAsLandlord' });
  ViewingSchedule.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordSchedule' });

  // Payment <-> ViewingSchedule
  ViewingSchedule.hasMany(Payment, { foreignKey: 'viewing_schedule_id', as: 'payments' });
  Payment.belongsTo(ViewingSchedule, { foreignKey: 'viewing_schedule_id', as: 'viewingSchedule' });

  // Complaint <-> Room
  Room.hasMany(Complaint, { foreignKey: 'room_id', as: 'complaints' });
  Complaint.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // Complaint <-> User (Tenant)
  User.hasMany(Complaint, { foreignKey: 'tenant_id', as: 'complaintsAsTenant' });
  Complaint.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // Complaint <-> User (Landlord)
  User.hasMany(Complaint, { foreignKey: 'landlord_id', as: 'complaintsAsLandlord' });
  Complaint.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlordComplaint' });

  // Conversation <-> User (Participant 1)
  User.hasMany(Conversation, { foreignKey: 'participant_1_id', as: 'conversationsAsParticipant1' });
  Conversation.belongsTo(User, { foreignKey: 'participant_1_id', as: 'participant1' });

  // Conversation <-> User (Participant 2)
  User.hasMany(Conversation, { foreignKey: 'participant_2_id', as: 'conversationsAsParticipant2' });
  Conversation.belongsTo(User, { foreignKey: 'participant_2_id', as: 'participant2' });

  // Conversation <-> Room
  Room.hasMany(Conversation, { foreignKey: 'room_id', as: 'conversations' });
  Conversation.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

  // Message <-> Conversation
  Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
  Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

  // Message <-> User (Sender)
  User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

  // Notification <-> User
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Favorite <-> User (Tenant)
  User.hasMany(Favorite, { foreignKey: 'tenant_id', as: 'favorites' });
  Favorite.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

  // Favorite <-> Room
  Room.hasMany(Favorite, { foreignKey: 'room_id', as: 'favorites' });
  Favorite.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
};

module.exports = {
  sequelize,
  Role,
  User,
  OtpVerification,
  Room,
  RoomImage,
  Facility,
  RoomFacility,
  RentalRequest,
  Payment,
  Contract,
  ViewingSchedule,
  Complaint,
  Conversation,
  Message,
  Notification,
  Booking,
  Favorite,
  defineAssociations,
};
