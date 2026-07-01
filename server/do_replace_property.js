const fs = require('fs');
const file = 'd:/Kì 5/swp391-rbl-project-team_2/server/src/controllers/roomController.js';
let content = fs.readFileSync(file, 'utf8');

const searchPropertiesCode = `// =========================================================
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

    if (keyword) {
      const matchingLandlords = await User.findAll({
        where: {
          [Op.and]: [
            { is_deleted: false },
            sequelize.where(sequelize.col('full_name'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`))
          ]
        },
        attributes: ['user_id'],
      });
      const landlordIds = matchingLandlords.map((u) => u.user_id);

      const keywordConditions = [
        sequelize.where(sequelize.col('Room.title'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)),
        sequelize.where(sequelize.col('Room.description'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)),
        sequelize.where(sequelize.col('Room.address'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)),
        sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)),
        sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)),
        sequelize.where(sequelize.col('Room.ward'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + keyword + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`))
      ];
      if (landlordIds.length > 0) {
        keywordConditions.push({ landlord_id: { [Op.in]: landlordIds } });
      }
      where[Op.or] = keywordConditions;
    }

    if (city || district) {
        where[Op.and] = where[Op.and] || [];
        if (city) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.city'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + city + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)));
        }
        if (district) {
            where[Op.and].push(sequelize.where(sequelize.col('Room.district'), 'LIKE', sequelize.literal(\`\${sequelize.escape('%' + district + '%')} COLLATE SQL_Latin1_General_CP1_CI_AI\`)));
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
          having: sequelize.literal(\`COUNT(DISTINCT [facility_id]) >= \${facIds.length}\`)
        });
        const validRoomIds = roomsWithFacilities.map(r => r.room_id);
        where.room_id = { [Op.in]: validRoomIds };
      } else {
        where.room_id = null; // Forces empty result if no valid facility matches
      }
    }

    include.push({ model: Facility, as: 'facilities', through: { attributes: [] }, required: false });

    // Fetch all matching rooms to group them (up to 1000 to prevent overload)
    const { count, rows } = await Room.findAndCountAll({
      where,
      include,
      limit: 1000, 
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    const groups = {};
    rows.forEach(room => {
       const key = room.property_id ? \`prop_\${room.property_id}\` : \`addr_\${room.landlord_id}_\${room.address}\`;
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
               rooms: []
           };
       }
       
       const group = groups[key];
       const price = parseFloat(room.price_per_month);
       if (price < group.minPrice) group.minPrice = price;
       if (price > group.maxPrice) group.maxPrice = price;
       
       const qty = room.quantity || 1;
       const availQty = room.available_quantity !== undefined ? room.available_quantity : qty;
       
       group.totalRooms += qty;
       if (room.status === 'available') {
           group.availableRooms += availQty;
       }
       group.rooms.push({
           roomId: room.room_id,
           title: room.title,
           pricePerMonth: room.price_per_month,
           areaSqm: room.area_sqm,
           bedrooms: room.bedrooms,
           maxOccupants: room.max_occupants,
           status: room.status,
           thumbnailUrl: room.thumbnail_url,
           facilities: room.facilities,
       });
    });

    let resultList = Object.values(groups);
    
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
    let whereClause = { is_deleted: false };
    
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
           thumbnailUrl: room.thumbnail_url,
           images: room.images,
           facilities: room.facilities,
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
`;

content = content.replace('module.exports = {', searchPropertiesCode + '\nmodule.exports = {\n  searchProperties,\n  getPublicPropertyDetails,');

fs.writeFileSync(file, content);
console.log("SUCCESS");
