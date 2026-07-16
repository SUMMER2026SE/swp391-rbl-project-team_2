const { Op } = require('sequelize');
const { RentalRequest, Room, User, Notification } = require('../models');

// =========================================================
// POST /api/tenant/rental-requests
// Create a new rental request
// =========================================================
const createRentalRequest = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { 
      roomId, 
      message, 
      requestedMoveInDate, 
      leaseDurationMonths,
      tenantName,
      tenantIc,
      tenantIcIssueDate,
      tenantIcIssuePlace,
      tenantPermanentAddress
    } = req.body;

    // Verify tenant has a phone number
    const tenant = await User.findByPk(tenantId);
    if (!tenant || !tenant.phone) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải cập nhật số điện thoại trong trang cá nhân trước khi gửi yêu cầu thuê phòng.'
      });
    }

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
      lease_duration_months: leaseDurationMonths || null,
      tenant_name: tenantName,
      tenant_ic: tenantIc,
      tenant_ic_issue_date: tenantIcIssueDate || null,
      tenant_ic_issue_place: tenantIcIssuePlace,
      tenant_permanent_address: tenantPermanentAddress,
    });

    // Create notification for landlord
    await Notification.create({
      user_id: room.landlord_id,
      title: 'New Rental Request',
      message: `You have a new rental request for ${room.title}.`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    // Emit socket event to landlord
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${room.landlord_id}`).emit('new_notification', {
        title: 'New Rental Request',
        message: `You have a new rental request for ${room.title}.`,
        type: 'rental_request'
      });
    }

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
        tenantName: rentalRequest.tenant_name,
        tenant_name: rentalRequest.tenant_name,
        tenantIc: rentalRequest.tenant_ic,
        tenant_ic: rentalRequest.tenant_ic,
        tenantIcIssueDate: rentalRequest.tenant_ic_issue_date,
        tenant_ic_issue_date: rentalRequest.tenant_ic_issue_date,
        tenantIcIssuePlace: rentalRequest.tenant_ic_issue_place,
        tenant_ic_issue_place: rentalRequest.tenant_ic_issue_place,
        tenantPermanentAddress: rentalRequest.tenant_permanent_address,
        tenant_permanent_address: rentalRequest.tenant_permanent_address,
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
        tenantName: req.tenant_name,
        tenant_name: req.tenant_name,
        tenantIc: req.tenant_ic,
        tenant_ic: req.tenant_ic,
        tenantIcIssueDate: req.tenant_ic_issue_date,
        tenant_ic_issue_date: req.tenant_ic_issue_date,
        tenantIcIssuePlace: req.tenant_ic_issue_place,
        tenant_ic_issue_place: req.tenant_ic_issue_place,
        tenantPermanentAddress: req.tenant_permanent_address,
        tenant_permanent_address: req.tenant_permanent_address,
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
        tenantName: rentalRequest.tenant_name,
        tenant_name: rentalRequest.tenant_name,
        tenantIc: rentalRequest.tenant_ic,
        tenant_ic: rentalRequest.tenant_ic,
        tenantIcIssueDate: rentalRequest.tenant_ic_issue_date,
        tenant_ic_issue_date: rentalRequest.tenant_ic_issue_date,
        tenantIcIssuePlace: rentalRequest.tenant_ic_issue_place,
        tenant_ic_issue_place: rentalRequest.tenant_ic_issue_place,
        tenantPermanentAddress: rentalRequest.tenant_permanent_address,
        tenant_permanent_address: rentalRequest.tenant_permanent_address,
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

    if (rentalRequest.status !== 'pending' && rentalRequest.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only pending or approved requests can be cancelled.',
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

    // Emit socket event to landlord
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rentalRequest.landlord_id}`).emit('new_notification', {
        title: 'Rental Request Cancelled',
        message: `A tenant has cancelled their rental request for ${rentalRequest.room.title}.`,
        type: 'rental_request'
      });
    }

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

// =========================================================
// POST /api/tenant/rental-requests/:requestId/request-contract
// Tenant requests a contract after rental request is approved
// =========================================================
const requestContract = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const tenantId = req.user.userId;
    const { message, startDate, durationMonths, tenantName, tenantIc, tenantIcIssueDate, tenantIcIssuePlace, tenantPermanentAddress } = req.body;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, tenant_id: tenantId },
      include: [
        { model: Room, as: 'room' },
      ],
    });

    if (!rentalRequest) {
      return res.status(404).json({ success: false, message: 'Rental request not found.' });
    }

    if (rentalRequest.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Rental request must be approved before requesting a contract.' });
    }

    if (!startDate || !durationMonths) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ngày dọn vào và thời hạn thuê.',
      });
    }

    if (!tenantName || !tenantIc || !tenantIcIssueDate || !tenantIcIssuePlace || !tenantPermanentAddress) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin cá nhân của bạn phục vụ cho hợp đồng.',
      });
    }

    if (tenantIc.length !== 12 || !/^\d{12}$/.test(tenantIc)) {
      return res.status(400).json({
        success: false,
        message: 'Số CCCD phải có đúng 12 chữ số.',
      });
    }

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày nhận phòng không thể ở quá khứ.',
      });
    }

    const { Contract } = require('../models');
    let contract = await Contract.findOne({
      where: { 
        room_id: rentalRequest.room_id,
        tenant_id: tenantId,
        status: { [require('sequelize').Op.in]: ['draft', 'pending_signature', 'pending_payment', 'active'] }
      }
    });

    let end = new Date(startDate);
    end.setMonth(end.getMonth() + parseInt(durationMonths));

    if (contract) {
      if (contract.status !== 'draft') {
        return res.status(400).json({ success: false, message: 'A contract has already been requested or created for this room.' });
      }
      
      // Update existing draft contract
      await contract.update({
        start_date: startDate,
        end_date: end,
        tenant_name: tenantName,
        tenant_ic: tenantIc,
        tenant_ic_issue_date: tenantIcIssueDate || null,
        tenant_ic_issue_place: tenantIcIssuePlace,
        tenant_permanent_address: tenantPermanentAddress,
      });
    } else {
      // Generate a unique contract number
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      contract = await Contract.create({
        room_id: rentalRequest.room_id,
        tenant_id: tenantId,
        landlord_id: rentalRequest.room.landlord_id,
        contract_number: `CT-${timestamp}-${random}`,
        status: 'draft',
        start_date: startDate,
        end_date: end,
        monthly_rent: rentalRequest.room.price_per_month,
        deposit_amount: rentalRequest.room.price_per_month, // Usually 1 month rent
        tenant_name: tenantName,
        tenant_ic: tenantIc,
        tenant_ic_issue_date: tenantIcIssueDate || null,
        tenant_ic_issue_place: tenantIcIssuePlace,
        tenant_permanent_address: tenantPermanentAddress,
      });
    }

    rentalRequest.status = 'contract_requested';
    rentalRequest.requested_move_in_date = startDate;
    rentalRequest.lease_duration_months = parseInt(durationMonths);
    const safeNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    rentalRequest.updated_at = safeNow;
    await rentalRequest.save();

    await Notification.create({
      user_id: rentalRequest.room.landlord_id,
      title: 'Contract Requested',
      message: `Tenant has requested a contract for "${rentalRequest.room.title}".`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    // Emit socket event to landlord
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rentalRequest.room.landlord_id}`).emit('new_notification', {
        title: 'Contract Requested',
        message: `Tenant has requested a contract for "${rentalRequest.room.title}".`,
        type: 'contract'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Contract requested successfully! Waiting for landlord to draft.',
      data: {
        contractId: contract.contract_id,
        status: contract.status,
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
  requestContract,
};
