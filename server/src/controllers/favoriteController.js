const { Favorite, Room, User, RoomImage } = require('../models');

// =========================================================
// POST /api/tenant/favorites/:roomId
// Add room to favorites
// =========================================================
const addFavorite = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { roomId } = req.params;

    // Check if room exists
    const room = await Room.findOne({
      where: { room_id: roomId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { tenant_id: tenantId, room_id: roomId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Room is already in your favorites.',
      });
    }

    const favorite = await Favorite.create({
      tenant_id: tenantId,
      room_id: roomId,
    });

    return res.status(201).json({
      success: true,
      message: 'Room added to favorites successfully!',
      data: {
        favoriteId: favorite.favorite_id,
        roomId: favorite.room_id,
        createdAt: favorite.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/tenant/favorites/:roomId
// Remove room from favorites
// =========================================================
const removeFavorite = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { roomId } = req.params;

    const favorite = await Favorite.findOne({
      where: { tenant_id: tenantId, room_id: roomId },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found.',
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      success: true,
      message: 'Room removed from favorites successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/tenant/favorites
// Get all favorite rooms
// =========================================================
const getMyFavorites = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Step 1: Get favorite records (without deep nested includes to avoid MSSQL subquery issues)
    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: { tenant_id: tenantId },
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'description', 'address', 'city', 'district', 'ward', 'price_per_month', 'area_sqm', 'room_type', 'max_occupants', 'bedrooms', 'status', 'thumbnail_url', 'landlord_id'],
          where: { is_deleted: false },
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    // Step 2: Enrich rooms with landlord and images info
    const enrichedData = await Promise.all(
      favorites.map(async (fav) => {
        let landlord = null;
        let images = [];

        if (fav.room) {
          // Get landlord info
          landlord = await User.findOne({
            where: { user_id: fav.room.landlord_id },
            attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'],
          });

          // Get room images
          images = await RoomImage.findAll({
            where: { room_id: fav.room.room_id },
            attributes: ['image_id', 'image_url', 'is_primary'],
          });
        }

        return {
          favoriteId: fav.favorite_id,
          favorite_id: fav.favorite_id,
          roomId: fav.room_id,
          room_id: fav.room_id,
          room: fav.room ? {
            ...fav.room.toJSON(),
            landlord,
            images,
          } : null,
          createdAt: fav.created_at,
          created_at: fav.created_at,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedData,
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
  addFavorite,
  removeFavorite,
  getMyFavorites,
};
