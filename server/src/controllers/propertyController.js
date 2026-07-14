const { Op } = require('sequelize');
const { sequelize, Property, Room, RoomImage, Facility, RoomFacility, Contract, Payment, User } = require('../models');

// =========================================================
// POST /api/landlord/properties
// Create a new property (building/house)
// =========================================================
const createProperty = async (req, res, next) => {
  try {
    const { name, description, address, city, district, ward, totalFloors, latitude, longitude } = req.body;
    const landlordId = req.user.userId;

    // Validate required fields
    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and city are required.',
      });
    }

    const propertyData = {
      landlord_id: landlordId,
      name,
      description,
      address,
      city,
      district,
      ward,
      total_floors: totalFloors || 1,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: 'active',
    };

    if (req.file) {
      propertyData.thumbnail_url = req.file.path;
    }

    const property = await Property.create(propertyData);

    return res.status(201).json({
      success: true,
      message: 'Property created successfully!',
      data: {
        propertyId: property.property_id,
        name: property.name,
        address: property.address,
        city: property.city,
        district: property.district,
        totalFloors: property.total_floors,
        latitude: property.latitude,
        longitude: property.longitude,
        status: property.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/properties
// Get all properties for a landlord
// =========================================================
const getProperties = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Property.findAndCountAll({
      where: { landlord_id: landlordId, is_deleted: false },
      include: [
        {
          model: Room,
          as: 'rooms',
          where: { is_deleted: false },
          required: false,
          attributes: ['room_id', 'title', 'floor', 'room_number', 'price_per_month', 'area_sqm', 'status'],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    const data = rows.map(property => {
      const rooms = property.rooms || [];
      const totalRooms = rooms.length;
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const rentedRooms = rooms.filter(r => r.status === 'rented').length;
      const prices = rooms.map(r => parseFloat(r.price_per_month) || 0).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        propertyId: property.property_id,
        name: property.name,
        description: property.description,
        address: property.address,
        city: property.city,
        district: property.district,
        ward: property.ward,
        totalFloors: property.total_floors,
        thumbnailUrl: property.thumbnail_url,
        status: property.status,
        createdAt: property.created_at,
        stats: {
          totalRooms,
          availableRooms,
          rentedRooms,
          occupancyRate: totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0,
          priceRange: { min: minPrice, max: maxPrice },
        },
      };
    });

    return res.status(200).json({
      success: true,
      data,
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
// GET /api/landlord/properties/:propertyId
// Get property details
// =========================================================
const getPropertyDetails = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const landlordId = req.user.userId;

    const property = await Property.findOne({
      where: { property_id: propertyId, landlord_id: landlordId, is_deleted: false },
      include: [
        {
          model: Room,
          as: 'rooms',
          where: { is_deleted: false },
          required: false,
          include: [
            { model: RoomImage, as: 'images' },
            { model: Facility, as: 'facilities', through: { attributes: [] } },
          ],
          order: [['floor', 'ASC'], ['room_number', 'ASC']],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        propertyId: property.property_id,
        name: property.name,
        description: property.description,
        address: property.address,
        city: property.city,
        district: property.district,
        ward: property.ward,
        totalFloors: property.total_floors,
        thumbnailUrl: property.thumbnail_url,
        latitude: property.latitude,
        longitude: property.longitude,
        status: property.status,
        rooms: (property.rooms || []).map(room => ({
          roomId: room.room_id,
          title: room.title,
          floor: room.floor,
          roomNumber: room.room_number,
          pricePerMonth: room.price_per_month,
          areaSqm: room.area_sqm,
          status: room.status,
          thumbnailUrl: room.thumbnail_url,
          maxOccupants: room.max_occupants,
          images: room.images,
          facilities: room.facilities,
        })),
        createdAt: property.created_at,
        updatedAt: property.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/properties/:propertyId
// Update property
// =========================================================
const updateProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const landlordId = req.user.userId;
    const { name, description, address, city, district, ward, totalFloors, latitude, longitude } = req.body;

    const property = await Property.findOne({
      where: { property_id: propertyId, landlord_id: landlordId, is_deleted: false },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    if (name) property.name = name;
    if (description !== undefined) property.description = description;
    if (address) property.address = address;
    if (city) property.city = city;
    if (district !== undefined) property.district = district;
    if (ward !== undefined) property.ward = ward;
    if (totalFloors) property.total_floors = totalFloors;
    if (latitude !== undefined) property.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) property.longitude = longitude ? parseFloat(longitude) : null;
    if (req.file) property.thumbnail_url = req.file.path;

    property.updated_at = new Date();
    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully!',
      data: {
        propertyId: property.property_id,
        name: property.name,
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        status: property.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/properties/:propertyId
// Soft delete property
// =========================================================
const deleteProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const landlordId = req.user.userId;

    const property = await Property.findOne({
      where: { property_id: propertyId, landlord_id: landlordId, is_deleted: false },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    property.is_deleted = true;
    property.updated_at = new Date();
    await property.save();

    // Also soft-delete all rooms belonging to this property
    await Room.update(
      { is_deleted: true, updated_at: new Date() },
      { where: { property_id: propertyId, landlord_id: landlordId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Property and its rooms deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/properties/:propertyId/dashboard
// Get dashboard data for a single property
// =========================================================
const getPropertyDashboard = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const landlordId = req.user.userId;

    // Verify ownership
    const property = await Property.findOne({
      where: { property_id: propertyId, landlord_id: landlordId, is_deleted: false },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Get all rooms for this property
    const rooms = await Room.findAll({
      where: { property_id: propertyId, is_deleted: false },
      attributes: ['room_id', 'title', 'floor', 'room_number', 'price_per_month', 'area_sqm', 'status', 'max_occupants', 'thumbnail_url', 'quantity', 'available_quantity'],
      order: [['floor', 'ASC'], ['room_number', 'ASC']],
    });

    // Get room IDs for financial queries
    const roomIds = rooms.map(r => r.room_id);

    // Room statistics (accounting for quantity)
    let totalRooms = 0;
    let availableRooms = 0;
    let rentedRooms = 0;
    let maintenanceRooms = 0;

    rooms.forEach(r => {
      const q = r.quantity || 1;
      const aq = (r.available_quantity !== undefined && r.available_quantity !== null)
                 ? r.available_quantity
                 : (r.status === 'rented' ? 0 : q);
      totalRooms += q;
      availableRooms += aq;
      rentedRooms += (q - aq);
      if (r.status === 'maintenance') maintenanceRooms += q; // Rough approximation
    });

    // Financial data SCOPED to this property only
    let totalRevenue = 0;
    let pendingPayments = 0;
    let activeContracts = 0;

    if (roomIds.length > 0) {
      totalRevenue = await Payment.sum('net_amount', {
        where: {
          room_id: { [Op.in]: roomIds },
          payout_status: 'completed',
        },
      }) || 0;

      pendingPayments = await Payment.sum('amount', {
        where: {
          room_id: { [Op.in]: roomIds },
          status: 'pending',
        },
      }) || 0;

      activeContracts = await Contract.count({
        where: {
          room_id: { [Op.in]: roomIds },
          status: 'active',
        },
      });
    }

    // Fetch active/pending contracts to map physical rooms on the floor plan
    let activeContractsList = [];
    if (roomIds.length > 0) {
      activeContractsList = await Contract.findAll({
        where: {
          room_id: { [Op.in]: roomIds },
          status: { [Op.in]: ['active', 'pending', 'pending_signature', 'pending_payment'] }
        },
        attributes: ['contract_id', 'room_id', 'assigned_room_number', 'status', 'tenant_name']
      });
    }

    // Build floor plan structure (simulated physical rooms based on quantity)
    const floorPlan = {};
    rooms.forEach(room => {
      const floor = room.floor || 1;
      if (!floorPlan[floor]) {
        floorPlan[floor] = [];
      }
      
      const qty = room.quantity || 1;
      // Get contracts for this room type
      const roomContracts = activeContractsList.filter(c => c.room_id === room.room_id);
      
      // Push blocks for each active contract
      roomContracts.forEach(contract => {
        floorPlan[floor].push({
          roomId: `contract-${contract.contract_id}`,
          originalRoomId: room.room_id,
          title: room.title,
          roomNumber: contract.assigned_room_number ? `Phòng ${contract.assigned_room_number}` : `Chưa gán số phòng`,
          pricePerMonth: room.price_per_month,
          areaSqm: room.area_sqm,
          status: (contract.status === 'active' || contract.status === 'completed') ? 'rented' : 'pending',
          maxOccupants: room.max_occupants,
          thumbnailUrl: room.thumbnail_url,
          tenantName: contract.tenant_name
        });
      });
      
      // Calculate remaining empty blocks
      const emptyBlocks = qty - roomContracts.length;
      
      const allNumbers = room.room_number ? room.room_number.split(',').map(s => s.trim()).filter(Boolean) : [];
      const rentedNumbers = roomContracts.map(c => c.assigned_room_number?.trim()).filter(Boolean);
      const availableNumbers = allNumbers.filter(n => !rentedNumbers.includes(n));

      for (let i = 0; i < emptyBlocks; i++) {
        const assignedNumber = availableNumbers[i];

        floorPlan[floor].push({
          roomId: `empty-${room.room_id}-${i}`,
          originalRoomId: room.room_id,
          title: room.title,
          roomNumber: assignedNumber ? `Phòng ${assignedNumber}` : `Trống (${room.title})`,
          pricePerMonth: room.price_per_month,
          areaSqm: room.area_sqm,
          status: (room.status === 'pending' || room.status === 'rejected' || room.status === 'inactive' || room.status === 'maintenance') ? room.status : 'available',
          maxOccupants: room.max_occupants,
          thumbnailUrl: room.thumbnail_url,
        });
      }
    });

    // Monthly revenue for this property (last 6 months)
    const revenueChart = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      let revenue = 0;
      if (roomIds.length > 0) {
        revenue = await Payment.sum('net_amount', {
          where: {
            room_id: { [Op.in]: roomIds },
            payout_status: 'completed',
            payout_date: { [Op.between]: [date, nextDate] },
          },
        }) || 0;
      }

      revenueChart.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        property: {
          propertyId: property.property_id,
          name: property.name,
          address: property.address,
          city: property.city,
          district: property.district,
          totalFloors: property.total_floors,
        },
        stats: {
          totalRooms,
          availableRooms,
          rentedRooms,
          maintenanceRooms,
          occupancyRate: totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0,
          totalRevenue,
          pendingPayments,
          activeContracts,
        },
        floorPlan,
        revenueChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/properties/:propertyId/rooms/duplicate
// Duplicate a room within a property
// =========================================================
const duplicateRoom = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { sourceRoomId, count = 1, targetFloor, roomNumbers } = req.body;
    const landlordId = req.user.userId;

    // Verify property ownership
    const property = await Property.findOne({
      where: { property_id: propertyId, landlord_id: landlordId, is_deleted: false },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Find source room
    const sourceRoom = await Room.findOne({
      where: { room_id: sourceRoomId, property_id: propertyId, is_deleted: false },
      include: [
        { model: Facility, as: 'facilities', through: { attributes: [] } },
      ],
    });

    if (!sourceRoom) {
      return res.status(404).json({
        success: false,
        message: 'Source room not found in this property.',
      });
    }

    const isCustomNumbers = Array.isArray(roomNumbers) && roomNumbers.length > 0;
    const duplicateCount = Math.min(isCustomNumbers ? roomNumbers.length : (parseInt(count) || 1), 20); // Max 20 at a time
    const floor = targetFloor || sourceRoom.floor || 1;

    // Get existing room count on that floor to auto-generate room numbers
    const existingOnFloor = await Room.count({
      where: { property_id: propertyId, floor, is_deleted: false },
    });

    const createdRooms = [];
    for (let i = 0; i < duplicateCount; i++) {
      let roomNumber = '';
      if (isCustomNumbers && roomNumbers[i]) {
        roomNumber = String(roomNumbers[i]);
      } else {
        roomNumber = `${floor}${String(existingOnFloor + i + 1).padStart(2, '0')}`;
      }

      const newRoom = await Room.create({
        landlord_id: landlordId,
        property_id: propertyId,
        floor,
        room_number: roomNumber,
        title: `${sourceRoom.title}`,
        description: sourceRoom.description,
        address: property.address,
        city: property.city,
        district: property.district,
        ward: property.ward,
        price_per_month: sourceRoom.price_per_month,
        area_sqm: sourceRoom.area_sqm,
        room_type: sourceRoom.room_type,
        bedrooms: sourceRoom.bedrooms,
        max_occupants: sourceRoom.max_occupants,
        status: 'pending',
        thumbnail_url: sourceRoom.thumbnail_url,
      });

      // Copy facilities
      if (sourceRoom.facilities && sourceRoom.facilities.length > 0) {
        for (const facility of sourceRoom.facilities) {
          await RoomFacility.create({
            room_id: newRoom.room_id,
            facility_id: facility.facility_id,
          });
        }
      }

      createdRooms.push({
        roomId: newRoom.room_id,
        roomNumber: newRoom.room_number,
        floor: newRoom.floor,
        title: newRoom.title,
      });
    }

    return res.status(201).json({
      success: true,
      message: `${duplicateCount} room(s) duplicated successfully!`,
      data: createdRooms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyDetails,
  updateProperty,
  deleteProperty,
  getPropertyDashboard,
  duplicateRoom,
};
