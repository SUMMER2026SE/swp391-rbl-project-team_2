const { Room, Facility, RoomFacility } = require('../models');

// =========================================================
// POST /api/landlord/rooms/:roomId/facilities
// Add facility to room
// =========================================================
const addFacility = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { facilityName, facilityType, category } = req.body;
    const landlordId = req.user.userId;

    if (!facilityName) {
      return res.status(400).json({
        success: false,
        message: 'Facility name is required.',
      });
    }

    // Verify room ownership
    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const [facility] = await Facility.findOrCreate({
      where: { facility_name: facilityName },
      defaults: {
        category: category || 'room',
        facility_type: facilityType || 'other',
      }
    });

    // Link room and facility
    await RoomFacility.findOrCreate({
      where: {
        room_id: roomId,
        facility_id: facility.facility_id
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Facility added successfully!',
      data: {
        facilityId: facility.facility_id,
        facilityName: facility.facility_name,
        category: facility.category,
        facilityType: facility.facility_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/rooms/:roomId/facilities
// Get all facilities for a room
// =========================================================
const getRoomFacilities = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const landlordId = req.user.userId;

    // Verify room ownership
    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
      include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: room.facilities.map(f => ({
        facilityId: f.facility_id,
        facilityName: f.facility_name,
        category: f.category,
        facilityType: f.facility_type,
        createdAt: f.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/rooms/:roomId/facilities/:facilityId
// Remove facility from room
// =========================================================
const removeFacility = async (req, res, next) => {
  try {
    const { roomId, facilityId } = req.params;
    const landlordId = req.user.userId;

    // Verify room ownership
    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const roomFacility = await RoomFacility.findOne({
      where: { room_id: roomId, facility_id: facilityId },
    });

    if (!roomFacility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found in this room.',
      });
    }

    await roomFacility.destroy();

    return res.status(200).json({
      success: true,
      message: 'Facility removed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rooms/:roomId/facilities/:facilityId
// Update facility
// =========================================================
const updateFacility = async (req, res, next) => {
  try {
    const { roomId, facilityId } = req.params;
    const { facilityName, facilityType, category } = req.body;
    const landlordId = req.user.userId;

    // Verify room ownership
    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const roomFacility = await RoomFacility.findOne({
      where: { facility_id: facilityId, room_id: roomId },
    });

    if (!roomFacility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found in this room.',
      });
    }

    const facility = await Facility.findByPk(facilityId);
    if (!facility) {
       return res.status(404).json({ success: false, message: 'Facility not found.' });
    }

    if (facilityName) facility.facility_name = facilityName;
    if (facilityType) facility.facility_type = facilityType;
    if (category) facility.category = category;

    await facility.save();

    return res.status(200).json({
      success: true,
      message: 'Facility updated successfully!',
      data: {
        facilityId: facility.facility_id,
        facilityName: facility.facility_name,
        facilityType: facility.facility_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFacility,
  getRoomFacilities,
  removeFacility,
  updateFacility,
};
