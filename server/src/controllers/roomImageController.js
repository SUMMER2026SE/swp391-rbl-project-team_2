const { Room, RoomImage } = require('../models');

// =========================================================
// POST /api/landlord/rooms/:roomId/images
// Upload room image
// =========================================================
const uploadRoomImage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const landlordId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
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

    // Generate image URL
    const imageUrl = req.file.path;

    // Check if this should be primary image
    const existingImages = await RoomImage.count({ where: { room_id: roomId } });
    const isPrimary = existingImages === 0;

    // Create image record
    const image = await RoomImage.create({
      room_id: roomId,
      image_url: imageUrl,
      is_primary: isPrimary,
      display_order: existingImages,
    });

    // Update room thumbnail if primary
    if (isPrimary) {
      room.thumbnail_url = imageUrl;
      await room.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: {
        imageId: image.image_id,
        imageUrl: image.image_url,
        isPrimary: image.is_primary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/rooms/:roomId/images
// Get all images for a room
// =========================================================
const getRoomImages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
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

    const images = await RoomImage.findAll({
      where: { room_id: roomId },
      order: [['display_order', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: images.map(img => ({
        imageId: img.image_id,
        imageUrl: img.image_url,
        isPrimary: img.is_primary,
        displayOrder: img.display_order,
        createdAt: img.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/rooms/:roomId/images/:imageId
// Delete room image
// =========================================================
const deleteRoomImage = async (req, res, next) => {
  try {
    const { roomId, imageId } = req.params;
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

    const image = await RoomImage.findOne({
      where: { image_id: imageId, room_id: roomId },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found.',
      });
    }

    const wasPrimary = image.is_primary;
    await image.destroy();

    // If deleted image was primary, set another as primary
    if (wasPrimary) {
      const nextImage = await RoomImage.findOne({
        where: { room_id: roomId },
        order: [['display_order', 'ASC']],
      });

      if (nextImage) {
        nextImage.is_primary = true;
        await nextImage.save();
        room.thumbnail_url = nextImage.image_url;
      } else {
        room.thumbnail_url = null;
      }
      await room.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/rooms/:roomId/images/:imageId/primary
// Set image as primary
// =========================================================
const setPrimaryImage = async (req, res, next) => {
  try {
    const { roomId, imageId } = req.params;
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

    const image = await RoomImage.findOne({
      where: { image_id: imageId, room_id: roomId },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found.',
      });
    }

    // Remove primary from all images
    await RoomImage.update(
      { is_primary: false },
      { where: { room_id: roomId } }
    );

    // Set this image as primary
    image.is_primary = true;
    await image.save();

    // Update room thumbnail
    room.thumbnail_url = image.image_url;
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Primary image updated successfully!',
      data: {
        imageId: image.image_id,
        imageUrl: image.image_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadRoomImage,
  getRoomImages,
  deleteRoomImage,
  setPrimaryImage,
};
