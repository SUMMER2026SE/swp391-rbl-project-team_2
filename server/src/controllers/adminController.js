const { User, Role, Room, Payment, RentalRequest, Complaint, Contract, ViewingSchedule } = require('../models');
const { Op } = require('sequelize');

// =========================================================
// GET /api/admin/users
// =========================================================
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, as: 'role' },
        { model: Room, as: 'rooms', attributes: ['room_id'] } // to count rooms
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedUsers = users.map(user => {
      // Map DB role 'Admin', 'Tenant', 'Landlord' to 'ADMIN', 'TENANT', 'LANDLORD'
      const roleName = user.role.role_name.toUpperCase();
      let status = 'Active';
      if (user.is_banned) status = 'Suspended';
      else if (user.is_deleted) status = 'Deleted';
      else if (!user.is_active) status = 'Inactive';

      return {
        id: `USR-${user.user_id.toString().padStart(3, '0')}`,
        rawId: user.user_id,
        name: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: roleName,
        status: status,
        joined: user.created_at,
        rooms: user.rooms ? user.rooms.length : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/admin/users/:id/status
// =========================================================
const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { action } = req.body; // 'activate' or 'suspend'

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'activate') {
      await user.update({ is_banned: false, is_active: true });
    } else if (action === 'suspend') {
      await user.update({ is_banned: true });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    return res.status(200).json({
      success: true,
      message: `User ${action}d successfully`
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/dashboard/stats
// =========================================================
const getDashboardStats = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total Revenue (Current Month)
    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        paid_date: { [Op.gte]: startOfMonth }
      }
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);

    // Active Tenants
    const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });
    const activeTenants = await User.count({
      where: { role_id: tenantRole.role_id, is_active: true, is_banned: false }
    });

    // Total Listings
    const totalListings = await Room.count({ where: { is_deleted: false } });

    // Pending Listings
    const pendingListings = await Room.count({ where: { status: 'pending', is_deleted: false } });

    // Occupancy Rate
    const rentedRooms = await Room.count({ where: { status: 'rented', is_deleted: false } });
    const occupancyRate = totalListings > 0 ? Math.round((rentedRooms / totalListings) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeTenants,
        totalListings,
        pendingListings,
        occupancyRate: `${occupancyRate}%`
      }
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/dashboard/revenue-chart
// =========================================================
const getRevenueChart = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        paid_date: { [Op.gte]: startOfYear }
      }
    });

    // Group by month
    const monthlyRevenue = Array(12).fill(0);
    payments.forEach(p => {
      const monthIndex = new Date(p.paid_date).getMonth();
      monthlyRevenue[monthIndex] += Number(p.platform_fee || 0);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, index) => ({
      month,
      revenue: monthlyRevenue[index]
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/dashboard/recent-activities
// =========================================================
const getRecentActivities = async (req, res, next) => {
  try {
    // We will combine recent payments and recent rental requests, sort them, and take top 5
    const recentPayments = await Payment.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'tenant', attributes: ['full_name'] },
        { model: Room, as: 'room', attributes: ['title'] }
      ]
    });

    const recentRequests = await RentalRequest.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'tenant', attributes: ['full_name'] },
        { model: Room, as: 'room', attributes: ['title'] }
      ]
    });

    let activities = [];

    recentPayments.forEach(p => {
      activities.push({
        id: `pay-${p.payment_id}`,
        type: 'Payment',
        message: `${p.tenant?.full_name || 'A user'} paid rent for ${p.room?.title || 'a room'}`,
        time: p.created_at
      });
    });

    recentRequests.forEach(r => {
      activities.push({
        id: `req-${r.request_id}`,
        type: 'Request',
        message: `${r.tenant?.full_name || 'A user'} submitted a rental request for ${r.room?.title || 'a room'}`,
        time: r.created_at
      });
    });

    // Sort descending by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Take top 5
    activities = activities.slice(0, 5);

    // Format time to readable string (e.g., "2 min ago")
    const now = new Date();
    activities = activities.map(a => {
      const diffMs = now - new Date(a.time);
      const diffMins = Math.floor(diffMs / 60000);
      let timeStr = '';
      if (diffMins < 60) timeStr = `${diffMins} min ago`;
      else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hr ago`;
      else timeStr = `${Math.floor(diffMins / 1440)} days ago`;

      return { ...a, time: timeStr };
    });

    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/rooms
// =========================================================
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: { is_deleted: false },
      include: [
        { model: User, as: 'landlord', attributes: ['full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedRooms = rooms.map(room => {
      // Create mock performance stats since it's not fully tracked in DB yet
      return {
        id: `PRP-${room.room_id.toString().padStart(4, '0')}`,
        rawId: room.room_id,
        title: room.title,
        location: `${room.district}, ${room.city}`,
        district: room.district,
        city: room.city,
        room_type: room.room_type,
        price: room.price_per_month,
        image: room.thumbnail_url || 'https://via.placeholder.com/200',
        landlord: { name: room.landlord?.full_name, type: 'Verified Host' },
        status: room.status.charAt(0).toUpperCase() + room.status.slice(1),
        performance: { views: Math.floor(Math.random() * 2000), inquiries: Math.floor(Math.random() * 50) }
      };
    });

    return res.status(200).json({ success: true, data: formattedRooms });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/admin/rooms/:id/status
// =========================================================
const updateRoomStatus = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { status, reason } = req.body; 

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const updateData = { status: status.toLowerCase() };
    if (updateData.status === 'rejected') {
      updateData.rejection_reason = reason || null;
    } else {
      updateData.rejection_reason = null; // Clear if re-approved or changed
    }

    await room.update(updateData);

    if (updateData.status === 'rejected' && reason) {
      const { Notification } = require('../models');
      await Notification.create({
        user_id: room.landlord_id,
        title: 'Listing Rejected',
        message: `Your listing "${room.title}" was rejected by the admin. Reason: ${reason}`,
        notification_type: 'system',
        related_id: room.room_id
      });
    } else if (updateData.status === 'available') {
      const { Notification } = require('../models');
      await Notification.create({
        user_id: room.landlord_id,
        title: 'Listing Approved',
        message: `Good news! Your listing "${room.title}" has been approved and is now live.`,
        notification_type: 'system',
        related_id: room.room_id
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/transactions
// =========================================================
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Payment.findAll({
      include: [
        { model: User, as: 'tenant', attributes: ['full_name', 'avatar_url'] },
        { model: Room, as: 'room', attributes: ['title'] },
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedTransactions = transactions.map(tx => ({
      id: `TRX-${tx.payment_id.toString().padStart(4, '0')}`,
      rawId: tx.payment_id,
      roomId: tx.room_id,
      date: tx.created_at,
      tenant: tx.tenant?.full_name || 'Unknown',
      avatarUrl: tx.tenant?.avatar_url || '',
      property: tx.room?.title || 'Unknown',
      type: tx.payment_type.charAt(0).toUpperCase() + tx.payment_type.slice(1).replace('_', ' '),
      amount: Number(tx.amount),
      status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1)
    }));

    return res.status(200).json({ success: true, data: formattedTransactions });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/complaints
// =========================================================
const getAllComplaints = async (req, res, next) => {
  try {
    console.log('>>> [getAllComplaints] Started');
    const complaints = await Complaint.findAll({
      include: [
        { model: User, as: 'tenant', attributes: ['full_name'] },
        { model: User, as: 'landlordComplaint', attributes: ['full_name'] },
        { model: Room, as: 'room', attributes: ['title'] }
      ],
      order: [['created_at', 'DESC']]
    });
    console.log('>>> [getAllComplaints] Query finished, got records:', complaints.length);

    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    console.log('>>> [getAllComplaints] ERROR:', error.message);
    next(error);
  }
};

// =========================================================
// GET /api/admin/payouts
// =========================================================
const getPayouts = async (req, res, next) => {
  try {
    const payouts = await Payment.findAll({
      where: {
        status: 'completed', // Only payouts for completed tenant payments
      },
      include: [
        { model: User, as: 'tenant', attributes: ['full_name', 'email'] },
        { model: User, as: 'landlordPayment', attributes: ['full_name', 'email', 'phone'] },
        { model: Room, as: 'room', attributes: ['title'] }
      ],
      order: [['paid_date', 'DESC']]
    });

    return res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/admin/payouts/:id/process
// =========================================================
const processPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body; // e.g., 5 for 5%

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.payout_status === 'completed') {
      return res.status(400).json({ success: false, message: 'Payout already processed' });
    }

    const rate = parseFloat(commissionRate) || 0;
    const platformFee = (payment.amount * rate) / 100;
    const netAmount = payment.amount - platformFee;

    payment.platform_fee = platformFee;
    payment.net_amount = netAmount;
    payment.payout_status = 'completed';
    payment.payout_date = new Date();

    await payment.save();

    return res.status(200).json({ success: true, data: payment, message: 'Payout processed successfully' });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/admin/disputes
// Fetch all disputed viewing schedules
// =========================================================
const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await ViewingSchedule.findAll({
      where: {
        status: {
          [Op.in]: ['disputed', 'dispute_resolved']
        }
      },
      include: [
        { model: User, as: 'tenant', attributes: ['full_name', 'email'] },
        { model: User, as: 'landlordSchedule', attributes: ['full_name', 'email'] },
        { model: Room, as: 'room', attributes: ['title'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    return res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/admin/disputes/:scheduleId/resolve
// Case 6: Resolve Dispute
// =========================================================
const resolveDispute = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const { outcome } = req.body; // 'A' (Landlord wrong), 'B' (Tenant wrong), 'C' (Shared fault)

    const schedule = await ViewingSchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found' });
    }

    const payment = await Payment.findOne({
      where: { viewing_schedule_id: schedule.schedule_id, status: 'completed' }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Completed payment not found' });
    }

    const total = parseFloat(payment.amount);

    if (outcome === 'A') {
      // 100% refund to tenant
      payment.refund_amount = total;
      payment.net_amount = 0;
      payment.platform_fee = 0;
      payment.status = 'refunded';
    } else if (outcome === 'B') {
      // 0% refund, Landlord 95%, Platform 5%
      payment.refund_amount = 0;
      payment.net_amount = total * 0.95;
      payment.platform_fee = total * 0.05;
      payment.payout_status = 'pending'; // To be paid to landlord
    } else if (outcome === 'C') {
      // 50% refund, Landlord 45%, Platform 5%
      payment.refund_amount = total * 0.50;
      payment.net_amount = total * 0.45;
      payment.platform_fee = total * 0.05;
      payment.status = 'refunded'; // Partial refund
      payment.payout_status = 'pending';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid outcome' });
    }

    await payment.save();
    schedule.status = 'dispute_resolved';
    await schedule.save();

    // Unlock the room since the viewing schedule process has ended
    if (schedule.room_id) {
      await Room.update({ status: 'available' }, { where: { room_id: schedule.room_id } });
    }

    return res.status(200).json({ success: true, message: `Dispute resolved with outcome ${outcome}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getDashboardStats,
  getRevenueChart,
  getRecentActivities,
  getAllRooms,
  updateRoomStatus,
  getAllTransactions,
  getAllComplaints,
  getPayouts,
  processPayout,
  getAllDisputes,
  resolveDispute
};
