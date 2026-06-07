const { Op } = require('sequelize');
const { Room, RoomImage, Facility, User } = require('../models');

// =========================================================
// POST /api/landlord/rooms
// Create a new room
// =========================================================
const createRoom = async (req, res, next) => {
  try {
    const { title, description, address, city, district, ward, pricePerMonth, areaSqm, roomType, maxOccupants, bedrooms } = req.body;
    const landlordId = req.user.userId;

    // Validate required fields
    if (!title || !address || !city || !pricePerMonth) {
      return res.status(400).json({
        success: false,
        message: 'Title, address, city, and price per month are required.',
      });
    }

    // Validate price
    if (isNaN(pricePerMonth) || pricePerMonth <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per month must be a positive number.',
      });
    }

    const roomData = {
      landlord_id: landlordId,
      title,
      description,
      address,
      city,
      district,
      ward,
      price_per_month: pricePerMonth,
      area_sqm: areaSqm,
      room_type: roomType || 'single',
      bedrooms: bedrooms || 1,
      max_occupants: maxOccupants || 1,
      status: 'pending', // Requires admin approval
    };

    if (req.file) {
      roomData.thumbnail_url = `/uploads/${req.file.filename}`;
    }

    const room = await Room.create(roomData);

    return res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      data: {
        roomId: room.room_id,
        title: room.title,
        address: room.address,
        pricePerMonth: room.price_per_month,
        status: room.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/rooms
// Get all rooms for landlord
// =========================================================
const getLandlordRooms = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { landlord_id: landlordId, is_deleted: false };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Room.findAndCountAll({
      where,
      include: [
        { model: RoomImage, as: 'images' },
        { model: Facility, as: 'facilities' },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(room => ({
        roomId: room.room_id,
        title: room.title,
        address: room.address,
        city: room.city,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
        status: room.status,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities,
        createdAt: room.created_at,
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
// GET /api/landlord/rooms/:roomId
// Get room details
// =========================================================
const getRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const landlordId = req.user.userId;

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
      include: [
        { model: RoomImage, as: 'images' },
        { model: Facility, as: 'facilities' },
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        roomId: room.room_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        district: room.district,
        ward: room.ward,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
        status: room.status,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities,
        landlord: room.landlord,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rooms/:roomId
// Update room
// =========================================================
const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const landlordId = req.user.userId;
    const { title, description, address, city, district, ward, pricePerMonth, areaSqm, roomType, maxOccupants, bedrooms, status } = req.body;

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Update fields
    if (title) room.title = title;
    if (description) room.description = description;
    if (address) room.address = address;
    if (city) room.city = city;
    if (district) room.district = district;
    if (ward) room.ward = ward;
    if (pricePerMonth) {
      if (isNaN(pricePerMonth) || pricePerMonth <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price per month must be a positive number.',
        });
      }
      room.price_per_month = pricePerMonth;
    }
    if (areaSqm) room.area_sqm = areaSqm;
    if (roomType) room.room_type = roomType;
    if (maxOccupants) room.max_occupants = maxOccupants;
    if (bedrooms) room.bedrooms = bedrooms;
    if (status) {
      if (room.status === 'pending' || room.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update status of a room that is pending approval or rejected.',
        });
      }
      room.status = status;
    }
    if (req.file) room.thumbnail_url = `/uploads/${req.file.filename}`;

    room.updated_at = new Date();
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully!',
      data: {
        roomId: room.room_id,
        title: room.title,
        status: room.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/rooms/:roomId
// Soft delete room
// =========================================================
const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const landlordId = req.user.userId;

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    room.is_deleted = true;
    room.updated_at = new Date();
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rooms/:roomId/status
// Update room status
// =========================================================
const updateRoomStatus = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    const landlordId = req.user.userId;

    if (!status || !['available', 'rented', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: available, rented, maintenance, or inactive.',
      });
    }

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (room.status === 'pending' || room.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Cannot update status of a room that is pending approval or rejected.',
      });
    }

    room.status = status;
    room.updated_at = new Date();
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room status updated successfully!',
      data: {
        roomId: room.room_id,
        status: room.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/listings (PUBLIC)
// Get all active rooms for public browsing
// =========================================================
const getAllPublicRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Room.findAndCountAll({
      where: { is_deleted: false, status: 'available' },
      include: [
        { model: RoomImage, as: 'images' },
        { model: Facility, as: 'facilities' },
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'avatar_url'] }
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(room => ({
        roomId: room.room_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        status: room.status,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities,
        landlord: room.landlord,
        createdAt: room.created_at,
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
// GET /api/listings/:roomId (PUBLIC)
// Get details of a public room
// =========================================================
const getPublicRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      where: { room_id: roomId, is_deleted: false },
      include: [
        { model: RoomImage, as: 'images' },
        { model: Facility, as: 'facilities' },
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        roomId: room.room_id,
        landlordId: room.landlord_id,
        landlord_id: room.landlord_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        district: room.district,
        ward: room.ward,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
        status: room.status,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities,
        landlord: room.landlord,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};// =========================================================
// GET /api/listings/search (PUBLIC)
// Search rooms with multiple filters
// =========================================================
const searchRooms = async (req, res, next) => {
  try {
    const {
      keyword,
      city,
      district,
      minPrice,
      maxPrice,
      roomType,
      bedrooms,
      amenities,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const where = { is_deleted: false };
    
    // Default to available rooms if status not provided, otherwise use provided status
    if (status) {
      where.status = status;
    } else {
      where.status = 'available';
    }

    // Keyword search (title, address, or landlord name)
    if (keyword) {
      const matchingLandlords = await User.findAll({
        where: { full_name: { [Op.like]: `%${keyword}%` }, is_deleted: false },
        attributes: ['user_id'],
      });
      const landlordIds = matchingLandlords.map((u) => u.user_id);

      const keywordConditions = [
        { title: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
      ];
      if (landlordIds.length > 0) {
        keywordConditions.push({ landlord_id: { [Op.in]: landlordIds } });
      }
      where[Op.or] = keywordConditions;
    }

    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }
    
    if (district) {
      where.district = { [Op.like]: `%${district}%` };
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price_per_month = {};
      if (minPrice) where.price_per_month[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price_per_month[Op.lte] = parseFloat(maxPrice);
    }

    // Room type
    if (roomType) {
      // roomType could be multiple comma-separated values in some implementations, but let's support exact match or array
      const types = roomType.split(',').map(t => t.trim());
      where.room_type = { [Op.in]: types };
    }

    // Bedrooms (use max_occupants as fallback)
    if (bedrooms) {
      const parsedBedrooms = parseInt(bedrooms);
      if (!isNaN(parsedBedrooms)) {
        if (bedrooms.includes('+')) {
          where.max_occupants = { [Op.gte]: parsedBedrooms };
        } else {
          where.max_occupants = parsedBedrooms;
        }
      }
    }

    const include = [
      { model: RoomImage, as: 'images' },
      { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'avatar_url'] },
    ];

    // Handle amenities filtering via facilities join
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      include.push({
        model: Facility,
        as: 'facilities',
        where: {
          facility_name: { [Op.in]: amenityList }
        },
        required: true, // INNER JOIN so only rooms with these amenities are returned
      });
    } else {
      include.push({ model: Facility, as: 'facilities', required: false });
    }

    const { count, rows } = await Room.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true, // Needed because of INNER JOIN with facilities returning multiple rows
    });

    return res.status(200).json({
      success: true,
      data: rows.map(room => ({
        roomId: room.room_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        district: room.district,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        bedrooms: room.bedrooms,
        status: room.status,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities,
        landlord: room.landlord,
        createdAt: room.created_at,
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

module.exports = {
  createRoom,
  getLandlordRooms,
  getRoomDetails,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAllPublicRooms,
  getPublicRoomDetails,
  searchRooms,
};
