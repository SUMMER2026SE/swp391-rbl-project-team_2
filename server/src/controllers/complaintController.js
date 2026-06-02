const { Op } = require('sequelize');
const { Complaint, Room, User, Notification } = require('../models');

// =========================================================
// GET /api/landlord/complaints
// Get all complaints for landlord
// =========================================================
const getLandlordComplaints = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, priority, page = 1, limit = 10 } = req.query;

    const where = { landlord_id: landlordId };
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(complaint => ({
        complaintId: complaint.complaint_id,
        roomId: complaint.room_id,
        tenantId: complaint.tenant_id,
        title: complaint.title,
        description: complaint.description,
        complaintType: complaint.complaint_type,
        status: complaint.status,
        priority: complaint.priority,
        resolutionNotes: complaint.resolution_notes,
        room: complaint.room,
        tenant: complaint.tenant,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
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
// GET /api/landlord/complaints/:complaintId
// Get complaint details
// =========================================================
const getComplaintDetails = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const landlordId = req.user.userId;

    const complaint = await Complaint.findOne({
      where: { complaint_id: complaintId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        complaintId: complaint.complaint_id,
        roomId: complaint.room_id,
        tenantId: complaint.tenant_id,
        title: complaint.title,
        description: complaint.description,
        complaintType: complaint.complaint_type,
        status: complaint.status,
        priority: complaint.priority,
        resolutionNotes: complaint.resolution_notes,
        room: complaint.room,
        tenant: complaint.tenant,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/complaints/:complaintId/status
// Update complaint status
// =========================================================
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, resolutionNotes } = req.body;
    const landlordId = req.user.userId;

    if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: open, in_progress, resolved, or closed.',
      });
    }

    const complaint = await Complaint.findOne({
      where: { complaint_id: complaintId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    complaint.status = status;
    if (resolutionNotes) complaint.resolution_notes = resolutionNotes;
    complaint.updated_at = new Date();
    await complaint.save();

    // Create notification for tenant
    await Notification.create({
      user_id: complaint.tenant_id,
      title: `Complaint Status Updated: ${status.toUpperCase()}`,
      message: `Your complaint for ${complaint.room.title} has been updated to ${status}`,
      notification_type: 'complaint',
      related_id: complaint.complaint_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully!',
      data: {
        complaintId: complaint.complaint_id,
        status: complaint.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/complaints/:complaintId/priority
// Update complaint priority
// =========================================================
const updateComplaintPriority = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { priority } = req.body;
    const landlordId = req.user.userId;

    if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be: low, medium, high, or urgent.',
      });
    }

    const complaint = await Complaint.findOne({
      where: { complaint_id: complaintId, landlord_id: landlordId },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    complaint.priority = priority;
    complaint.updated_at = new Date();
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint priority updated successfully!',
      data: {
        complaintId: complaint.complaint_id,
        priority: complaint.priority,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordComplaints,
  getComplaintDetails,
  updateComplaintStatus,
  updateComplaintPriority,
};
