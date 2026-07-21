const { Op } = require('sequelize');
const { sequelize, Room, RoomImage, Facility, RoomFacility, User, Property } = require('../models');

// =========================================================
// POST /api/landlord/rooms
// Create a new room
// =========================================================
const createRoom = async (req, res, next) => {
  try {
    const { title, description, address, city, district, ward, pricePerMonth, areaSqm, maxOccupants, propertyId, floor, roomNumber, quantity, latitude, longitude } = req.body;
    const landlordId = req.user.userId;

    // Verify landlord's account is verified before posting a room
    const user = await User.findOne({ where: { user_id: landlordId } });
    if (!user || user.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn chưa được xác thực. Vui lòng hoàn tất xác thực thông tin cá nhân (CCCD) để có quyền đăng tin phòng.',
      });
    }

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

    // Check for duplicate room number under the same property
    if (propertyId && roomNumber) {
      const existingRoom = await Room.findOne({
        where: {
          property_id: propertyId,
          room_number: roomNumber.toString().trim(),
          is_deleted: false,
        },
      });
      if (existingRoom) {
        return res.status(409).json({
          success: false,
          message: 'Room is already exist',
        });
      }
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
      room_type: 'private_room',
      bedrooms: 1,
      max_occupants: maxOccupants ? Math.min(maxOccupants, 4) : 4,
      status: 'pending', // Requires admin approval
      property_id: propertyId || null,
      floor: floor || null,
      room_number: roomNumber || null,
      quantity: quantity || 1,
      available_quantity: quantity || 1,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
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

    // Emit socket event to admins
    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('new_notification', {
        title: 'New Room Listing',
        message: `A new room listing "${room.title}" is pending approval.`,
        type: 'room_approval'
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
        latitude: room.latitude,
        longitude: room.longitude,
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
        { model: Property, as: 'property', attributes: ['property_id', 'name', 'address', 'city', 'district'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    if (rows.length > 0) {
      const roomIds = rows.map(r => r.room_id);
      const facilitiesData = await Room.findAll({
        where: { room_id: roomIds },
        include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }]
      });
      const facilitiesMap = {};
      facilitiesData.forEach(r => {
        facilitiesMap[r.room_id] = r.facilities;
      });
      rows.forEach(room => {
        const facs = facilitiesMap[room.room_id] || [];
        room.facilities = facs;
        room.setDataValue('facilities', facs);
      });
    }

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
        propertyId: room.property_id,
        floor: room.floor,
        roomNumber: room.room_number,
        property: room.property,
        images: room.images,
        facilities: room.facilities || [],
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
        propertyId: room.property_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        district: room.district,
        ward: room.ward,
        latitude: room.latitude,
        longitude: room.longitude,
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
    const { title, description, address, city, district, ward, pricePerMonth, areaSqm, maxOccupants, status, roomNumber, latitude, longitude } = req.body;

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const originalPrice = room.price_per_month;
    const originalRoomNumber = room.room_number;

    if (room.status === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a room that is currently rented/occupied.',
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
    if (maxOccupants) room.max_occupants = Math.min(maxOccupants, 4);
    if (roomNumber !== undefined && roomNumber !== room.room_number && room.property_id) {
      const trimmedRoomNumber = roomNumber ? roomNumber.toString().trim() : null;
      if (trimmedRoomNumber) {
        const existingRoom = await Room.findOne({
          where: {
            property_id: room.property_id,
            room_number: trimmedRoomNumber,
            is_deleted: false,
            room_id: { [Op.ne]: roomId }
          }
        });
        if (existingRoom) {
          return res.status(409).json({
            success: false,
            message: 'Room is already exist',
          });
        }
      }
    }
    if (roomNumber !== undefined) room.room_number = roomNumber || null;
    if (status) {
      if (room.status === 'pending' || room.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update status of a room that is pending approval or rejected.',
        });
      }
      room.status = status;
    }
    if (latitude !== undefined) room.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) room.longitude = longitude ? parseFloat(longitude) : null;
    if (req.file) room.thumbnail_url = req.file.path;

    // Automatic status transitions
    if (room.status === 'rejected') {
      room.status = 'pending';
      room.rejection_reason = null;
    } else if (room.status === 'available') {
      const priceChanged = pricePerMonth !== undefined && Number(pricePerMonth) !== Number(originalPrice);
      const roomNumChanged = roomNumber !== undefined && String(roomNumber).trim() !== String(originalRoomNumber).trim();
      if (priceChanged || roomNumChanged) {
        room.status = 'pending';
      }
    }

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

    if (room.status === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a room that is currently rented/occupied.',
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
      where: { is_deleted: false, status: { [Op.in]: ['available', 'rented'] } },
      include: [
        { model: RoomImage, as: 'images' },
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'avatar_url', 'verification_status'] }
      ],

      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    if (rows.length > 0) {
      const roomIds = rows.map(r => r.room_id);
      const facilitiesData = await Room.findAll({
        where: { room_id: roomIds },
        include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }]
      });
      const facilitiesMap = {};
      facilitiesData.forEach(r => {
        facilitiesMap[r.room_id] = r.facilities;
      });
      rows.forEach(room => {
        const facs = facilitiesMap[room.room_id] || [];
        room.facilities = facs;
        room.setDataValue('facilities', facs);
      });
    }

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
        availableFrom: room.available_from,
        available_from: room.available_from,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities || [],
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
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url', 'verification_status'] },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const postCount = await Room.count({
      where: { landlord_id: room.landlord_id, is_deleted: false }
    });

    const rentedRoomCount = await Room.count({
      where: { landlord_id: room.landlord_id, is_deleted: false, status: 'rented' }
    });

    return res.status(200).json({
      success: true,
      data: {
        roomId: room.room_id,
        propertyId: room.property_id,
        landlordId: room.landlord_id,
        landlord_id: room.landlord_id,
        title: room.title,
        description: room.description,
        address: room.address,
        city: room.city,
        district: room.district,
        ward: room.ward,
        latitude: room.latitude,
        longitude: room.longitude,
        pricePerMonth: room.price_per_month,
        areaSqm: room.area_sqm,
        roomType: room.room_type,
        maxOccupants: room.max_occupants,
        bedrooms: room.bedrooms,
        status: room.status,
        availableFrom: room.available_from,
        available_from: room.available_from,
        thumbnailUrl: room.thumbnail_url,
        roomNumber: room.room_number,
        images: room.images,
        facilities: room.facilities,
        landlord: {
          ...room.landlord.toJSON(),
          postCount,
          rentedRoomCount
        },
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
      maxOccupants,
      facilities,
      nearbyFacilities,
      status,
      sort,
      landlordId,
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { is_deleted: false };

    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.in]: ['available', 'rented'] };
    }

    if (landlordId) {
      where.landlord_id = landlordId;
    }

    if (keyword) {
      const matchingLandlords = await User.findAll({
        where: {
          [Op.and]: [
            { is_deleted: false },
            sequelize.where(sequelize.col('full_name'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`))
          ]
        },
        attributes: ['user_id'],
      });
      const landlordIds = matchingLandlords.map((u) => u.user_id);

      const keywordConditions = [
        sequelize.where(sequelize.col('Room.title'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.description'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.address'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.ward'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`))
      ];
      if (landlordIds.length > 0) {
        keywordConditions.push({ landlord_id: { [Op.in]: landlordIds } });
      }
      where[Op.or] = keywordConditions;
    }

    if (city || district) {
        where[Op.and] = where[Op.and] || [];
        if (city) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + city + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)));
        }
        if (district) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + district + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)));
        }
    }

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

    if (rows.length > 0) {
      const roomIds = rows.map(r => r.room_id);
      const facilitiesData = await Room.findAll({
        where: { room_id: roomIds },
        include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }]
      });
      const facilitiesMap = {};
      facilitiesData.forEach(r => {
        facilitiesMap[r.room_id] = r.facilities;
      });
      rows.forEach(room => {
        const facs = facilitiesMap[room.room_id] || [];
        room.facilities = facs;
        room.setDataValue('facilities', facs);
      });
    }

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
        availableFrom: room.available_from,
        available_from: room.available_from,
        thumbnailUrl: room.thumbnail_url,
        images: room.images,
        facilities: room.facilities || [],
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

// =========================================================
// GET /api/listings/properties/search (PUBLIC)
// Search properties (groups rooms by property or standalone address)
// =========================================================
const searchProperties = async (req, res, next) => {
  try {
    const {
      keyword, city, district, minPrice, maxPrice, minArea, maxArea,
      maxOccupants, facilities, nearbyFacilities, status, sort, landlordId,
      page = 1, limit = 12,
    } = req.query;

    const where = { is_deleted: false };

    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.notIn]: ['inactive', 'pending', 'rejected'] };
    }

    if (landlordId) {
      where.landlord_id = landlordId;
    }

    let searchKeyword = keyword;
    let searchCity = city;
    let searchDistrict = district;

    // Smart heuristic preprocessor for natural language keyword search
    if (searchKeyword && !searchCity && !searchDistrict) {
      let kw = searchKeyword.toLowerCase().trim();
      
      // Extract City
      if (kw.includes('đà nẵng')) {
        searchCity = 'Thành phố Đà Nẵng';
        searchKeyword = searchKeyword.replace(/đà nẵng/gi, '').trim();
      } else if (kw.includes('hồ chí minh') || kw.includes('sài gòn') || kw.includes('hcm')) {
        searchCity = 'Thành phố Hồ Chí Minh';
        searchKeyword = searchKeyword.replace(/(hồ chí minh|sài gòn|hcm)/gi, '').trim();
      } else if (kw.includes('hà nội') || kw.includes('hn')) {
        searchCity = 'Thành phố Hà Nội';
        searchKeyword = searchKeyword.replace(/(hà nội|hn)/gi, '').trim();
      }

      // Re-evaluate lowercase keyword after city extraction
      kw = searchKeyword.toLowerCase().trim();

      // Extract District via dictionary map lookup
      const districtMap = {
        'bình thạnh': 'Quận Bình Thạnh',
        'gò vấp': 'Quận Gò Vấp',
        'phú nhuận': 'Quận Phú Nhuận',
        'tân bình': 'Quận Tân Bình',
        'tân phú': 'Quận Tân Phú',
        'thủ đức': 'Quận Thủ Đức',
        'liên chiểu': 'Quận Liên Chiểu',
        'hải châu': 'Quận Hải Châu',
        'thanh khê': 'Quận Thanh Khê',
        'sơn trà': 'Quận Sơn Trà',
        'ngũ hành sơn': 'Quận Ngũ Hành Sơn',
        'cẩm lệ': 'Quận Cẩm Lệ',
        'hòa vang': 'Huyện Hòa Vàng',
        'quận 1': 'Quận 1', 'q1': 'Quận 1',
        'quận 2': 'Quận 2', 'q2': 'Quận 2',
        'quận 3': 'Quận 3', 'q3': 'Quận 3',
        'quận 4': 'Quận 4', 'q4': 'Quận 4',
        'quận 5': 'Quận 5', 'q5': 'Quận 5',
        'quận 6': 'Quận 6', 'q6': 'Quận 6',
        'quận 7': 'Quận 7', 'q7': 'Quận 7',
        'quận 8': 'Quận 8', 'q8': 'Quận 8',
        'quận 9': 'Quận 9', 'q9': 'Quận 9',
        'quận 10': 'Quận 10', 'q10': 'Quận 10',
        'quận 11': 'Quận 11', 'q11': 'Quận 11',
        'quận 12': 'Quận 12', 'q12': 'Quận 12',
      };

      for (const [key, val] of Object.entries(districtMap)) {
        if (kw.includes(key)) {
          searchDistrict = val;
          // Strip the matched key and any optional "quận"/"huyện"/"q" prefix
          const stripRegex = new RegExp(`(quận|huyện|q)?\\s*${key}`, 'gi');
          searchKeyword = searchKeyword.replace(stripRegex, '').trim();
          break;
        }
      }

      // Clean prepositions, filler words, and generic room search words using a Set
      const genericStopWords = new Set([
        'tôi', 'muốn', 'tìm', 'kiếm', 'cần', 'cho', 'thuê', 'trống', 'ở', 'tại', 
        'phòng', 'trọ', 'nhà', 'căn', 'hộ', 'chung', 'cư', 'đâu', 'địa', 'chỉ', 
        'bản', 'đồ', 'giá', 'rẻ', 'tốt', 'chỗ', 'khu', 'vực', 'có', 'thể', 'được', 
        'nào', 'mới', 'đẹp'
      ]);

      const words = searchKeyword.split(/\s+/);
      const cleanWords = words.filter(word => {
        // Strip punctuation and check if the lowercased word is a stop word
        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        return cleanWord && !genericStopWords.has(cleanWord);
      });

      searchKeyword = cleanWords.join(' ').trim();
    }

    if (searchKeyword) {
      const matchingLandlords = await User.findAll({
        where: {
          [Op.and]: [
            { is_deleted: false },
            sequelize.where(sequelize.col('full_name'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`))
          ]
        },
        attributes: ['user_id'],
      });
      const landlordIds = matchingLandlords.map((u) => u.user_id);

      const keywordConditions = [
        sequelize.where(sequelize.col('Room.title'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.description'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.address'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)),
        sequelize.where(sequelize.col('Room.ward'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchKeyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`))
      ];
      if (landlordIds.length > 0) {
        keywordConditions.push({ landlord_id: { [Op.in]: landlordIds } });
      }
      where[Op.or] = keywordConditions;
    }

    if (searchCity || searchDistrict) {
        where[Op.and] = where[Op.and] || [];
        if (searchCity) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchCity + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)));
        }
        if (searchDistrict) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(`${sequelize.escape('%' + searchDistrict + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI`)));
        }
    }

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
      { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'avatar_url', 'phone'] },
      { model: Property, as: 'property' }
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

    // Fetch all matching rooms to group them (up to 1000 to prevent overload)
    const { count, rows } = await Room.findAndCountAll({
      where,
      include,
      limit: 1000, 
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    if (rows.length > 0) {
      const roomIds = rows.map(r => r.room_id);
      const facilitiesData = await Room.findAll({
        where: { room_id: roomIds },
        include: [{ model: Facility, as: 'facilities', through: { attributes: [] } }]
      });
      const facilitiesMap = {};
      facilitiesData.forEach(r => {
        facilitiesMap[r.room_id] = r.facilities;
      });
      rows.forEach(room => {
        const facs = facilitiesMap[room.room_id] || [];
        room.facilities = facs;
        room.setDataValue('facilities', facs);
      });
    }

    const groups = {};
    rows.forEach(room => {
       const key = room.property_id ? `prop_${room.property_id}` : `addr_${room.landlord_id}_${room.address}`;
       if (!groups[key]) {
           groups[key] = {
               id: key,
               propertyId: room.property_id || key,
               title: room.property ? room.property.name : (room.title + ' (Standalone)'),
               address: room.property ? room.property.address : room.address,
               city: room.city,
               district: room.district,
               landlord: room.landlord,
               thumbnailUrl: room.property?.thumbnail_url || room.thumbnail_url,
               minPrice: parseFloat(room.price_per_month),
               maxPrice: parseFloat(room.price_per_month),
               totalRooms: 0,
               availableRooms: 0,
               preBookableRooms: 0,
               rooms: []
           };
       }
       
       const group = groups[key];
       const price = parseFloat(room.price_per_month);
       if (price < group.minPrice) group.minPrice = price;
       if (price > group.maxPrice) group.maxPrice = price;
       
       const qty = room.quantity || 1;
       const availQty = (room.available_quantity !== null && room.available_quantity !== undefined) ? room.available_quantity : qty;
       
       group.totalRooms += qty;
       if (room.status === 'available') {
           group.availableRooms += availQty;
       } 
       if (room.status === 'rented' && room.available_from) {
           group.preBookableRooms += 1;
       }
       group.rooms.push({
           roomId: room.room_id,
           title: room.title,
           pricePerMonth: room.price_per_month,
           areaSqm: room.area_sqm,
           bedrooms: room.bedrooms,
           maxOccupants: room.max_occupants,
           status: room.status,
           available_from: room.available_from,
           availableFrom: room.available_from,
           thumbnailUrl: room.thumbnail_url,
           facilities: room.facilities,
       });
    });

    let resultList = Object.values(groups);

    // Filter out completely sold out properties (availableRooms === 0) if status is not explicitly requested
    // Disabled so tenants can see all properties/rooms regardless of availability
    /* if (!status) {
      resultList = resultList.filter(group => group.availableRooms > 0);
    } */
    
    // Sort logic
    if (sort) {
      if (sort === 'price_asc') resultList.sort((a, b) => a.minPrice - b.minPrice);
      else if (sort === 'price_desc') resultList.sort((a, b) => b.minPrice - a.minPrice);
    }

    // Manual Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const paginated = resultList.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        total: resultList.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(resultList.length / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/listings/properties/:id (PUBLIC)
// Get details of a property (or standalone group)
// =========================================================
const getPublicPropertyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let whereClause = { 
      is_deleted: false,
      status: { [Op.notIn]: ['inactive', 'pending', 'rejected'] } 
    };
    
    if (id.startsWith('prop_')) {
        whereClause.property_id = id.replace('prop_', '');
    } else if (id.startsWith('addr_')) {
        const parts = id.split('_');
        const landlordId = parts[1];
        const address = parts.slice(2).join('_');
        whereClause.property_id = null;
        whereClause.landlord_id = landlordId;
        whereClause.address = address;
    } else {
        whereClause.property_id = id;
    }

    const rooms = await Room.findAll({
      where: whereClause,
      include: [
        { model: RoomImage, as: 'images' },
        { model: Facility, as: 'facilities', through: { attributes: [] } },
        { model: User, as: 'landlord', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
        { model: Property, as: 'property' }
      ]
    });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const firstRoom = rooms[0];
    const propertyObj = {
       id: id,
       title: firstRoom.property ? firstRoom.property.name : (firstRoom.title + ' (Standalone)'),
       address: firstRoom.property ? firstRoom.property.address : firstRoom.address,
       city: firstRoom.city,
       district: firstRoom.district,
       latitude: firstRoom.property ? firstRoom.property.latitude : firstRoom.latitude,
       longitude: firstRoom.property ? firstRoom.property.longitude : firstRoom.longitude,
       description: firstRoom.property ? firstRoom.property.description : firstRoom.description,
       landlord: firstRoom.landlord,
       thumbnailUrl: firstRoom.property?.thumbnail_url || firstRoom.thumbnail_url,
       minPrice: Math.min(...rooms.map(r => parseFloat(r.price_per_month))),
       maxPrice: Math.max(...rooms.map(r => parseFloat(r.price_per_month))),
       rooms: rooms.map(room => ({
           roomId: room.room_id,
           title: room.title,
           pricePerMonth: room.price_per_month,
           areaSqm: room.area_sqm,
           bedrooms: room.bedrooms,
           maxOccupants: room.max_occupants,
           status: room.status,
           available_from: room.available_from,
           availableFrom: room.available_from,
           thumbnailUrl: room.thumbnail_url,
           images: room.images,
           facilities: room.facilities,
           roomNumber: room.room_number,
       }))
    };

    return res.status(200).json({
      success: true,
      data: propertyObj
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProperties,
  getPublicPropertyDetails,
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
