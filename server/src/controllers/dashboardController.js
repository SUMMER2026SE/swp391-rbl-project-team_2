const { Op } = require('sequelize');
const { Room, Contract, Payment, RentalRequest, Complaint, Notification, ViewingSchedule } = require('../models');

// =========================================================
// GET /api/landlord/dashboard/statistics
// Get landlord dashboard statistics
// =========================================================
const getDashboardStatistics = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;

    // Total rooms
    const totalRooms = await Room.count({
      where: { landlord_id: landlordId, is_deleted: false },
    });

    // Available rooms
    const availableRooms = await Room.count({
      where: { landlord_id: landlordId, status: 'available', is_deleted: false },
    });

    // Rented rooms
    const rentedRooms = await Room.count({
      where: { landlord_id: landlordId, status: 'rented', is_deleted: false },
    });

    // Active contracts
    const activeContracts = await Contract.count({
      where: { landlord_id: landlordId, status: 'active' },
    });

    // Total revenue (completed payouts)
    const totalRevenue = await Payment.sum('net_amount', {
      where: { landlord_id: landlordId, payout_status: 'completed' },
    });

    // Pending payments
    const pendingPayments = await Payment.sum('amount', {
      where: { landlord_id: landlordId, status: 'pending' },
    });

    // Pending rental requests
    const pendingRequests = await RentalRequest.count({
      where: { landlord_id: landlordId, status: 'pending' },
    });

    // Pending viewing schedules
    const pendingSchedules = await ViewingSchedule.count({
      where: { landlord_id: landlordId, status: 'pending' },
    });

    // Open complaints
    const openComplaints = await Complaint.count({
      where: { landlord_id: landlordId, status: 'open' },
    });

    // Unread notifications
    const unreadNotifications = await Notification.count({
      where: { user_id: landlordId, is_read: false },
    });

    return res.status(200).json({
      success: true,
      data: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          rented: rentedRooms,
        },
        contracts: {
          active: activeContracts,
        },
        payments: {
          totalRevenue: totalRevenue || 0,
          pending: pendingPayments || 0,
        },
        requests: {
          pending: pendingRequests,
        },
        schedules: {
          pending: pendingSchedules,
        },
        complaints: {
          open: openComplaints,
        },
        notifications: {
          unread: unreadNotifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/dashboard/recent-activity
// Get recent activity
// =========================================================
const getRecentActivity = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { limit = 10 } = req.query;

    // Recent rental requests
    const recentRequests = await RentalRequest.findAll({
      where: { landlord_id: landlordId },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      attributes: ['request_id', 'status', 'created_at'],
    });

    // Recent payments
    const recentPayments = await Payment.findAll({
      where: { landlord_id: landlordId },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      attributes: ['payment_id', 'amount', 'status', 'created_at'],
    });

    // Recent complaints
    const recentComplaints = await Complaint.findAll({
      where: { landlord_id: landlordId },
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      attributes: ['complaint_id', 'title', 'status', 'priority', 'created_at'],
    });

    return res.status(200).json({
      success: true,
      data: {
        recentRequests: recentRequests.map(req => ({
          requestId: req.request_id,
          status: req.status,
          createdAt: req.created_at,
        })),
        recentPayments: recentPayments.map(payment => ({
          paymentId: payment.payment_id,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.created_at,
        })),
        recentComplaints: recentComplaints.map(complaint => ({
          complaintId: complaint.complaint_id,
          title: complaint.title,
          status: complaint.status,
          priority: complaint.priority,
          createdAt: complaint.created_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/dashboard/revenue-chart
// Get revenue data for chart
// =========================================================
const getRevenueChart = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { months = 12 } = req.query;

    const revenueData = [];
    const now = new Date();

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const revenue = await Payment.sum('net_amount', {
        where: {
          landlord_id: landlordId,
          payout_status: 'completed',
          payout_date: {
            [Op.between]: [date, nextDate],
          },
        },
      });

      revenueData.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: revenue || 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/dashboard/room-status
// Get room status distribution
// =========================================================
const getRoomStatusDistribution = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;

    const statusDistribution = await Room.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('room_id')), 'count']],
      where: { landlord_id: landlordId, is_deleted: false },
      group: ['status'],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      data: statusDistribution.map(item => ({
        status: item.status,
        count: parseInt(item.count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStatistics,
  getRecentActivity,
  getRevenueChart,
  getRoomStatusDistribution,
};
