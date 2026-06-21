const { Booking, Room, User } = require('../models');

// @desc    Create a new booking (tenant)
// @route   POST /api/bookings
// @access  Private (Tenant)
exports.createBooking = async (req, res, next) => {
  try {
    const { listing_id, type } = req.body; // type: 'view_request' | 'deposit'
    const tenant_id = req.user.userId;

    // Validate type
    if (!['view', 'rent', 'view_request', 'deposit'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type. Must be view or rent.',
      });
    }

    // Check if room exists and get landlord_id
    const room = await Room.findByPk(listing_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    // Create booking
    const booking = await Booking.create({
      listing_id,
      tenant_id,
      landlord_id: room.landlord_id,
      type,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the logged in user (tenant or landlord)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const roleId = req.user.roleId; // 1 = Tenant, 2 = Landlord, 3 = Admin

    let whereClause = {};

    if (roleId === 2) {
      whereClause.landlord_id = userId;
    } else {
      whereClause.tenant_id = userId;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'price_per_month', 'address']
        },
        {
          model: User,
          as: roleId === 2 ? 'tenant' : 'landlordBooking',
          attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (landlord)
// @route   PUT /api/bookings/:id/status
// @access  Private (Landlord)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'rejected'
    const landlord_id = req.user.userId;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted or rejected.',
      });
    }

    const booking = await Booking.findOne({
      where: { booking_id: id, landlord_id }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not authorized.',
      });
    }

    booking.status = status;
    booking.updated_at = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
