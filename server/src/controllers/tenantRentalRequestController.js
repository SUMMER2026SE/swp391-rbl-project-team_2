const { Op } = require('sequelize');
const { RentalRequest, Room, User, Notification } = require('../models');

// =========================================================
// POST /api/tenant/rental-requests
// Create a new rental request
// =========================================================
const createRentalRequest = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { roomId, message, requestedMoveInDate, leaseDurationMonths } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required.',
      });
    }

    // Check if room exists and is available
    const room = await Room.findOne({
      where: { room_id: roomId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for rent.',
      });
    }

    // Tenant cannot rent their own room
    if (room.landlord_id === tenantId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a rental request for your own room.',
      });
    }

    // Check for duplicate pending request
    const existingRequest = await RentalRequest.findOne({
      where: {
        tenant_id: tenantId,
        room_id: roomId,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending rental request for this room.',
      });
    }

    // Create rental request
    const rentalRequest = await RentalRequest.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: room.landlord_id,
      status: 'pending',
      message: message || null,
      requested_move_in_date: requestedMoveInDate || null,
      lease_duration_months: leaseDurationMonths || 12,
    });

    // Create notification for landlord
    await Notification.create({
      user_id: room.landlord_id,
      title: 'New Rental Request',
      message: `You have a new rental request for ${room.title}.`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Rental request created successfully!',
      data: {
        requestId: rentalRequest.request_id,
        request_id: rentalRequest.request_id,
        roomId: rentalRequest.room_id,
        room_id: rentalRequest.room_id,
        status: rentalRequest.status,
        message: rentalRequest.message,
        requestedMoveInDate: rentalRequest.requested_move_in_date,
        leaseDurationMonths: rentalRequest.lease_duration_months,
        createdAt: rentalRequest.created_at,
        created_at: rentalRequest.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/tenant/rental-requests
// Get all rental requests for tenant
// =========================================================
const getMyRentalRequests = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { tenant_id: tenantId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await RentalRequest.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month', 'thumbnail_url', 'status'] },
        { model: User, as: 'landlordRequest', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
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
        landlordId: req.landlord_id,
        landlord_id: req.landlord_id,
        status: req.status,
        requestedMoveInDate: req.requested_move_in_date,
        requested_move_in_date: req.requested_move_in_date,
        leaseDurationMonths: req.lease_duration_months,
        lease_duration_months: req.lease_duration_months,
        message: req.message,
        rejectionReason: req.rejection_reason,
        rejection_reason: req.rejection_reason,
        room: req.room,
        landlord: req.landlordRequest,
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
// GET /api/tenant/rental-requests/:requestId
// Get rental request detail
// =========================================================
const getRentalRequestDetail = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const tenantId = req.user.userId;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, tenant_id: tenantId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'price_per_month', 'description', 'thumbnail_url', 'status'] },
        { model: User, as: 'landlordRequest', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
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
        landlordId: rentalRequest.landlord_id,
        landlord_id: rentalRequest.landlord_id,
        status: rentalRequest.status,
        requestedMoveInDate: rentalRequest.requested_move_in_date,
        requested_move_in_date: rentalRequest.requested_move_in_date,
        leaseDurationMonths: rentalRequest.lease_duration_months,
        lease_duration_months: rentalRequest.lease_duration_months,
        message: rentalRequest.message,
        rejectionReason: rentalRequest.rejection_reason,
        rejection_reason: rentalRequest.rejection_reason,
        room: rentalRequest.room,
        landlord: rentalRequest.landlordRequest,
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
// PUT /api/tenant/rental-requests/:requestId/cancel
// Cancel a rental request (only if pending)
// =========================================================
const cancelRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const tenantId = req.user.userId;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, tenant_id: tenantId },
      include: [
        { model: Room, as: 'room' },
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
        message: 'Only pending requests can be cancelled.',
      });
    }

    const safeNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    rentalRequest.status = 'cancelled';
    rentalRequest.updated_at = safeNow;
    await rentalRequest.save();

    // Create notification for landlord
    await Notification.create({
      user_id: rentalRequest.landlord_id,
      title: 'Rental Request Cancelled',
      message: `A tenant has cancelled their rental request for ${rentalRequest.room.title}.`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Rental request cancelled successfully!',
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
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestDetail,
  cancelRentalRequest,
};
