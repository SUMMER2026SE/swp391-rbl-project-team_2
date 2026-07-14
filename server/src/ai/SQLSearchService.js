const { Op } = require('sequelize');
const { Room, Facility, RoomImage, User, Contract, Booking, Complaint } = require('../models');

const SQL_CACHE = new Map();
const CACHE_TTL_MS = 60 * 1000; // Cache SQL queries for 1 minute to ensure freshness

/**
 * Service to execute database searches for rooms and personal status (contracts, bookings, complaints).
 */
class SQLSearchService {
  /**
   * Searches rooms dynamically based on criteria
   * @param {object} criteria Filter criteria (district, city, priceMin, priceMax, facilities, etc.)
   * @returns {Promise<Array>} List of rooms
   */
  static async searchRooms(criteria) {
    const cacheKey = JSON.stringify(criteria);
    
    // Check Cache
    if (SQL_CACHE.has(cacheKey)) {
      const { data, timestamp } = SQL_CACHE.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        console.log('[SQLSearchService] Cache hit for room search');
        return data;
      }
      SQL_CACHE.delete(cacheKey);
    }

    try {
      const where = { status: 'available', is_deleted: false };

      if (criteria.district) {
        where.district = { [Op.like]: `%${criteria.district}%` };
      }
      if (criteria.city) {
        where.city = { [Op.like]: `%${criteria.city}%` };
      }
      if (criteria.priceMin || criteria.priceMax) {
        where.price_per_month = {};
        if (criteria.priceMin) where.price_per_month[Op.gte] = criteria.priceMin;
        if (criteria.priceMax) where.price_per_month[Op.lte] = criteria.priceMax;
      }
      if (criteria.maxOccupants) {
        where.max_occupants = { [Op.gte]: criteria.maxOccupants };
      }
      if (criteria.minArea) {
        where.area_sqm = { [Op.gte]: criteria.minArea };
      }
      if (criteria.keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${criteria.keyword}%` } },
          { address: { [Op.like]: `%${criteria.keyword}%` } },
          { description: { [Op.like]: `%${criteria.keyword}%` } },
          { city: { [Op.like]: `%${criteria.keyword}%` } },
          { district: { [Op.like]: `%${criteria.keyword}%` } },
        ];
      }

      // If specific facilities are required, we first find matching rooms or do a join
      let include = [
        {
          model: Facility,
          as: 'facilities',
          attributes: ['facility_name'],
          through: { attributes: [] }
        },
        {
          model: RoomImage,
          as: 'images',
          attributes: ['image_url', 'is_primary'],
          limit: 3
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['full_name', 'email', 'phone', 'avatar_url']
        }
      ];

      const rooms = await Room.findAll({
        where,
        limit: 10,
        order: [['created_at', 'DESC']],
        include
      });

      // Filter by facilities on node side if search parameters contain facilities (Many-to-Many strict match)
      let filteredRooms = rooms;
      if (criteria.facilities && criteria.facilities.length > 0) {
        const reqFacs = criteria.facilities.map(f => f.toLowerCase());
        filteredRooms = rooms.filter(room => {
          const roomFacs = room.facilities ? room.facilities.map(f => f.facility_name.toLowerCase()) : [];
          return reqFacs.every(f => roomFacs.includes(f));
        });
      }

      // Save to cache
      SQL_CACHE.set(cacheKey, {
        data: filteredRooms,
        timestamp: Date.now()
      });

      return filteredRooms;
    } catch (err) {
      console.error('[SQLSearchService] Error searching rooms:', err.message);
      return [];
    }
  }

  /**
   * Searches rooms with full details for AI Summary Card rendering.
   * Returns richer data including images, facilities, and landlord info.
   * @param {object} criteria Filter criteria
   * @param {number} limit Max results (default 6)
   * @returns {Promise<Array>} List of rooms with full details
   */
  static async searchRoomsWithDetails(criteria, limit = 6) {
    try {
      const where = { status: 'available', is_deleted: false };

      if (criteria.district) {
        where.district = { [Op.like]: `%${criteria.district}%` };
      }
      if (criteria.city) {
        where.city = { [Op.like]: `%${criteria.city}%` };
      }
      if (criteria.priceMin || criteria.priceMax) {
        where.price_per_month = {};
        if (criteria.priceMin) where.price_per_month[Op.gte] = criteria.priceMin;
        if (criteria.priceMax) where.price_per_month[Op.lte] = criteria.priceMax;
      }
      if (criteria.maxOccupants) {
        where.max_occupants = { [Op.gte]: criteria.maxOccupants };
      }
      if (criteria.minArea) {
        where.area_sqm = { [Op.gte]: criteria.minArea };
      }
      if (criteria.keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${criteria.keyword}%` } },
          { address: { [Op.like]: `%${criteria.keyword}%` } },
          { description: { [Op.like]: `%${criteria.keyword}%` } },
          { city: { [Op.like]: `%${criteria.keyword}%` } },
          { district: { [Op.like]: `%${criteria.keyword}%` } },
        ];
      }

      const include = [
        {
          model: Facility,
          as: 'facilities',
          attributes: ['facility_id', 'facility_name'],
          through: { attributes: [] }
        },
        {
          model: RoomImage,
          as: 'images',
          attributes: ['image_url', 'is_primary']
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url']
        }
      ];

      const rooms = await Room.findAll({
        where,
        limit,
        order: [['created_at', 'DESC']],
        include
      });

      // Filter by facilities if specified
      let filteredRooms = rooms;
      if (criteria.facilities && criteria.facilities.length > 0) {
        const reqFacs = criteria.facilities.map(f => f.toLowerCase());
        filteredRooms = rooms.filter(room => {
          const roomFacs = room.facilities ? room.facilities.map(f => f.facility_name.toLowerCase()) : [];
          return reqFacs.every(f => roomFacs.includes(f));
        });
      }

      // Count total matching rooms (without limit)
      const totalCount = await Room.count({ where });

      return {
        rooms: filteredRooms,
        totalCount
      };
    } catch (err) {
      console.error('[SQLSearchService] Error searching rooms with details:', err.message);
      return { rooms: [], totalCount: 0 };
    }
  }

  /**
   * Retrieves active bookings for a specific tenant
   * @param {number} userId The tenant's user ID
   * @returns {Promise<Array>} List of bookings
   */
  static async getTenantBookings(userId) {
    if (!userId) return [];
    try {
      return await Booking.findAll({
        where: { tenant_id: userId },
        include: [{
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'address', 'price_per_month']
        }],
        order: [['created_at', 'DESC']],
        limit: 5
      });
    } catch (err) {
      console.error('[SQLSearchService] Error fetching bookings:', err.message);
      return [];
    }
  }

  /**
   * Retrieves active contracts for a specific tenant
   * @param {number} userId The tenant's user ID
   * @returns {Promise<Array>} List of contracts
   */
  static async getTenantContracts(userId) {
    if (!userId) return [];
    try {
      return await Contract.findAll({
        where: { tenant_id: userId },
        include: [{
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'address', 'price_per_month']
        }],
        order: [['created_at', 'DESC']],
        limit: 5
      });
    } catch (err) {
      console.error('[SQLSearchService] Error fetching contracts:', err.message);
      return [];
    }
  }

  /**
   * Retrieves complaints submitted by a tenant
   * @param {number} userId The tenant's user ID
   * @returns {Promise<Array>} List of complaints
   */
  static async getTenantComplaints(userId) {
    if (!userId) return [];
    try {
      return await Complaint.findAll({
        where: { tenant_id: userId },
        include: [{
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'address']
        }],
        order: [['created_at', 'DESC']],
        limit: 5
      });
    } catch (err) {
      console.error('[SQLSearchService] Error fetching complaints:', err.message);
      return [];
    }
  }

  /**
   * Search database for specific room details by ID (including owner and contract details)
   * @param {number} roomId Room ID
   * @returns {Promise<object|null>} Room details
   */
  static async getRoomDetails(roomId) {
    try {
      return await Room.findOne({
        where: { room_id: roomId, is_deleted: false },
        include: [
          {
            model: Facility,
            as: 'facilities',
            attributes: ['facility_name'],
            through: { attributes: [] }
          },
          {
            model: RoomImage,
            as: 'images',
            attributes: ['image_url', 'is_primary']
          },
          {
            model: User,
            as: 'landlord',
            attributes: ['full_name', 'email', 'phone', 'avatar_url']
          }
        ]
      });
    } catch (err) {
      console.error('[SQLSearchService] Error fetching room details:', err.message);
      return null;
    }
  }
}

module.exports = SQLSearchService;
