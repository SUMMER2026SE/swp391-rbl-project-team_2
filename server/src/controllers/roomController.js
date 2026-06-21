const { Op } = require('sequelize');
const { sequelize, Room, RoomImage, Facility, RoomFacility, User } = require('../models');

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
      roomData.thumbnail_url = req.file.path;
    }

    const room = await Room.create(roomData);

    if (req.file) {
      await RoomImage.create({
        room_id: room.room_id,
        image_url: req.file.path,
        is_primary: true,
        display_order: 0,
      });
    }

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
        { model: Facility, as: 'facilities', through: { attributes: [] } },
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
        district: room.district,
        ward: room.ward,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
        bedrooms: room.bedrooms,
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
        { model: Facility, as: 'facilities', through: { attributes: [] } },
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
        bedrooms: room.bedrooms,
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
    if (req.file) room.thumbnail_url = req.file.path;

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
        { model: Facility, as: 'facilities', through: { attributes: [] } },
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
        district: room.district,
        ward: room.ward,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
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
        { model: Facility, as: 'facilities', through: { attributes: [] } },
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
        bedrooms: room.bedrooms,
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
      minArea,
      maxArea,
      roomType,
      bedrooms,
      maxOccupants,
      facilities,
      nearbyFacilities,
      status,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { is_deleted: false };

    if (status) {
      where.status = status;
    } else {
      where.status = 'available';
    }

    if (keyword) {
      const keywordLower = `%${keyword}%`;
      const matchingLandlords = await User.findAll({
        where: { full_name: { [Op.like]: keywordLower }, is_deleted: false },
        attributes: ['user_id'],
      });
      const landlordIds = matchingLandlords.map((u) => u.user_id);

      const keywordConditions = [
        { title: { [Op.like]: keywordLower } },
        { description: { [Op.like]: keywordLower } },
        { address: { [Op.like]: keywordLower } },
        { city: { [Op.like]: keywordLower } },
        { district: { [Op.like]: keywordLower } },
        { ward: { [Op.like]: keywordLower } },
      ];
      if (landlordIds.length > 0) {
        keywordConditions.push({ landlord_id: { [Op.in]: landlordIds } });
      }
      where[Op.or] = keywordConditions;
    }

    if (city) where.city = { [Op.like]: `%${city}%` };
    if (district) where.district = { [Op.like]: `%${district}%` };

    if (minPrice || maxPrice) {
      where.price_per_month = {};
      if (minPrice) where.price_per_month[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price_per_month[Op.lte] = parseFloat(maxPrice);
    }

    if (minArea || maxArea) {
      where.area_sqm = {};
      if (minArea) where.area_sqm[Op.gte] = parseFloat(minArea);
      if (maxArea) where.area_sqm[Op.lte] = parseFloat(maxArea);
    }

    if (roomType) {
      // roomType maps the UI values directly to database values (either matching ENUM or whatever literal string is saved)
      const types = roomType.split(',').map(t => t.trim());
      where.room_type = { [Op.in]: types };
    }

    if (bedrooms) {
      const parsedBedrooms = parseInt(bedrooms);
      if (!isNaN(parsedBedrooms)) {
        if (bedrooms.includes('+')) {
          where.bedrooms = { [Op.gte]: parsedBedrooms };
        } else {
          where.bedrooms = parsedBedrooms;
        }
      }
    }

    if (maxOccupants) {
      const parsedOcc = parseInt(maxOccupants);
      if (!isNaN(parsedOcc)) {
        if (maxOccupants.includes('+')) {
          where.max_occupants = { [Op.gte]: parsedOcc };
        } else {
          where.max_occupants = parsedOcc;
        }
      }
    }

    const include = [
      { model: RoomImage, as: 'images' },
      { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'avatar_url'] },
    ];

    let facilityFilters = [];
    if (facilities) facilityFilters = facilityFilters.concat(facilities.split(',').map(f => f.trim()));
    if (nearbyFacilities) facilityFilters = facilityFilters.concat(nearbyFacilities.split(',').map(f => f.trim()));

    if (facilityFilters.length > 0) {
      const facs = await Facility.findAll({
        where: { facility_name: { [Op.in]: facilityFilters } },
        attributes: ['facility_id']
      });
      const facIds = facs.map(f => f.facility_id);
      
      if (facIds.length > 0) {
        const roomsWithFacilities = await RoomFacility.findAll({
          where: { facility_id: { [Op.in]: facIds } },
          attributes: ['room_id'],
          group: ['room_id'],
          having: sequelize.literal(`COUNT(DISTINCT [facility_id]) >= ${facIds.length}`)
        });
        const validRoomIds = roomsWithFacilities.map(r => r.room_id);
        where.room_id = { [Op.in]: validRoomIds };
      } else {
        where.room_id = null; // Forces empty result if no valid facility matches
      }
    }

    include.push({ model: Facility, as: 'facilities', through: { attributes: [] }, required: false });

    let order = [['created_at', 'DESC']];
    if (sort) {
      if (sort === 'price_asc') order = [['price_per_month', 'ASC']];
      else if (sort === 'price_desc') order = [['price_per_month', 'DESC']];
      else if (sort === 'area_desc') order = [['area_sqm', 'DESC']];
    }

    const { count, rows } = await Room.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      order,
      distinct: true,
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
        maxOccupants: room.max_occupants,
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
        pages: Math.ceil(count / parseInt(limit)),
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
