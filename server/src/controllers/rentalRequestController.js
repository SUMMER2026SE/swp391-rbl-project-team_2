const { Op } = require('sequelize');
const { RentalRequest, Room, User, Notification } = require('../models');

// =========================================================
// GET /api/landlord/rental-requests
// Get all rental requests for landlord
// =========================================================
const getLandlordRentalRequests = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { landlord_id: landlordId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await RentalRequest.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(req => ({
        requestId: req.request_id,
        request_id: req.request_id,
        roomId: req.room_id,
        room_id: req.room_id,
        tenantId: req.tenant_id,
        tenant_id: req.tenant_id,
        status: req.status,
        requestedMoveInDate: req.requested_move_in_date,
        requested_move_in_date: req.requested_move_in_date,
        leaseDurationMonths: req.lease_duration_months,
        lease_duration_months: req.lease_duration_months,
        message: req.message,
        rejectionReason: req.rejection_reason,
        rejection_reason: req.rejection_reason,
        room: req.room,
        tenant: req.tenant,
        createdAt: req.created_at,
        created_at: req.created_at,
        updatedAt: req.updated_at,
        updated_at: req.updated_at,
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/rental-requests/:requestId
// Get rental request details
// =========================================================
const getRentalRequestDetails = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const landlordId = req.user.userId;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'price_per_month', 'description'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        requestId: rentalRequest.request_id,
        request_id: rentalRequest.request_id,
        roomId: rentalRequest.room_id,
        room_id: rentalRequest.room_id,
        tenantId: rentalRequest.tenant_id,
        tenant_id: rentalRequest.tenant_id,
        status: rentalRequest.status,
        requestedMoveInDate: rentalRequest.requested_move_in_date,
        requested_move_in_date: rentalRequest.requested_move_in_date,
        leaseDurationMonths: rentalRequest.lease_duration_months,
        lease_duration_months: rentalRequest.lease_duration_months,
        message: rentalRequest.message,
        rejectionReason: rentalRequest.rejection_reason,
        rejection_reason: rentalRequest.rejection_reason,
        room: rentalRequest.room,
        tenant: rentalRequest.tenant,
        createdAt: rentalRequest.created_at,
        created_at: rentalRequest.created_at,
        updatedAt: rentalRequest.updated_at,
        updated_at: rentalRequest.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rental-requests/:requestId/approve
// Approve rental request
// =========================================================
const approveRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const landlordId = req.user.userId;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found.',
      });
    }

    if (rentalRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved.',
      });
    }

    const safeNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    rentalRequest.status = 'approved';
    rentalRequest.updated_at = safeNow;
    await rentalRequest.save();

    // Update room status to rented
    rentalRequest.room.status = 'rented';
    rentalRequest.room.updated_at = safeNow;
    await rentalRequest.room.save();

    // Create notification for tenant
    await Notification.create({
      user_id: rentalRequest.tenant_id,
      title: 'Rental Request Approved',
      message: `Your rental request for ${rentalRequest.room.title} has been approved!`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Rental request approved successfully!',
      data: {
        requestId: rentalRequest.request_id,
        status: rentalRequest.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rental-requests/:requestId/reject
// Reject rental request
// =========================================================
const rejectRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const landlordId = req.user.userId;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found.',
      });
    }

    if (rentalRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected.',
      });
    }

    const safeNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    rentalRequest.status = 'rejected';
    rentalRequest.rejection_reason = rejectionReason;
    rentalRequest.updated_at = safeNow;
    await rentalRequest.save();

    // Create notification for tenant
    await Notification.create({
      user_id: rentalRequest.tenant_id,
      title: 'Rental Request Rejected',
      message: `Your rental request for ${rentalRequest.room.title} has been rejected. Reason: ${rejectionReason}`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Rental request rejected successfully!',
      data: {
        requestId: rentalRequest.request_id,
        status: rentalRequest.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordRentalRequests,
  getRentalRequestDetails,
  approveRentalRequest,
  rejectRentalRequest,
};
