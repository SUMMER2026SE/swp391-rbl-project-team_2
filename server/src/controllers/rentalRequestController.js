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
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month', 'room_number'] },
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

    // Do not update room status to rented yet. VNPay return will do it after payment.
    // rentalRequest.room.status = 'rented';
    // rentalRequest.room.updated_at = safeNow;
    // await rentalRequest.room.save();

    // Create notification for tenant
    await Notification.create({
      user_id: rentalRequest.tenant_id,
      title: 'Rental Request Approved',
      message: `Your rental request for ${rentalRequest.room.title} has been approved!`,
      notification_type: 'rental_request',
      related_id: rentalRequest.request_id,
    });

    // Emit socket event to tenant
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rentalRequest.tenant_id}`).emit('new_notification', {
        title: 'Rental Request Approved',
        message: `Your rental request for ${rentalRequest.room.title} has been approved!`,
        type: 'rental_request'
      });
    }

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

    // Emit socket event to tenant
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rentalRequest.tenant_id}`).emit('new_notification', {
        title: 'Rental Request Rejected',
        message: `Your rental request for ${rentalRequest.room.title} has been rejected. Reason: ${rejectionReason}`,
        type: 'rental_request'
      });
    }

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
// =========================================================
// POST /api/landlord/rental-requests/:requestId/create-contract
// Landlord provides their details and signs the drafted contract
// =========================================================
const createContractFromRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const landlordId = req.user.userId;
    const {
      termsAndConditions,
      landlordName,
      landlordIc,
      landlordIcIssueDate,
      landlordIcIssuePlace,
      landlordPermanentAddress,
      landlordSignature,
      assignedRoomNumber,
    } = req.body;

    const rentalRequest = await RentalRequest.findOne({
      where: { request_id: requestId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!rentalRequest) {
      return res.status(404).json({ success: false, message: 'Rental request not found.' });
    }

    if (rentalRequest.status !== 'contract_requested') {
      return res.status(400).json({ success: false, message: 'Contract has not been requested by tenant yet.' });
    }

    if (!assignedRoomNumber) {
      return res.status(400).json({ success: false, message: 'Please assign a physical room number for this contract.' });
    }

    if (rentalRequest.room.available_quantity <= 0) {
      return res.status(400).json({ success: false, message: 'This room type is out of stock.' });
    }

    const { Contract } = require('../models');
    const contract = await Contract.findOne({
      where: {
        room_id: rentalRequest.room_id,
        tenant_id: rentalRequest.tenant_id,
        status: 'draft'
      }
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Draft contract not found.' });
    }

    let signatureUrl = landlordSignature;
    if (landlordSignature && landlordSignature.startsWith('data:image') && process.env.CLOUDINARY_URL) {
      try {
        const { cloudinary } = require('../config/cloudinary');
        const uploadResponse = await cloudinary.uploader.upload(landlordSignature, {
          folder: 'signatures',
        });
        signatureUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed for signature, falling back to base64", error);
      }
    }

    contract.terms_and_conditions = termsAndConditions;
    contract.landlord_name = landlordName;
    contract.landlord_ic = landlordIc;
    contract.landlord_ic_issue_date = landlordIcIssueDate || null;
    contract.landlord_ic_issue_place = landlordIcIssuePlace;
    contract.landlord_permanent_address = landlordPermanentAddress;
    contract.landlord_signature = signatureUrl;
    contract.assigned_room_number = assignedRoomNumber;
    contract.status = 'pending_signature';
    await contract.save();

    const roomToUpdate = rentalRequest.room;
    roomToUpdate.available_quantity -= 1;
    if (roomToUpdate.available_quantity <= 0) {
      roomToUpdate.status = 'rented';
    }
    await roomToUpdate.save();

    const safeNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    rentalRequest.status = 'contract_created';
    rentalRequest.updated_at = safeNow;
    await rentalRequest.save();

    await Notification.create({
      user_id: rentalRequest.tenant_id,
      title: 'Contract Ready to Sign',
      message: `The landlord has created the contract for ${rentalRequest.room.title}. Please review, sign, and pay the deposit.`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    // Emit socket event to tenant
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rentalRequest.tenant_id}`).emit('new_notification', {
        title: 'Contract Ready to Sign',
        message: `The landlord has created the contract for ${rentalRequest.room.title}. Please review, sign, and pay the deposit.`,
        type: 'contract'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contract created successfully. Waiting for tenant to sign.',
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
  getLandlordRentalRequests,
  getRentalRequestDetails,
  approveRentalRequest,
  rejectRentalRequest,
  createContractFromRequest,
};
