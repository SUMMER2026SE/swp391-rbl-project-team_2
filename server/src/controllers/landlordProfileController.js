const { User, sequelize } = require('../models');

// =========================================================
// GET /api/landlord/profile
// Get landlord profile
// =========================================================
const getLandlordProfile = async (req, res, next) => {
  try {
    console.log('📨 GET /api/landlord/profile - User ID:', req.user?.userId);
    console.log('📨 Full req.user object:', JSON.stringify(req.user, null, 2));
    
    const landlordId = req.user.userId;
    console.log('📨 Extracted landlordId:', landlordId);

    console.log('📨 Querying User with landlordId:', landlordId);
    const user = await User.findOne({
      where: { user_id: landlordId, is_deleted: false },
      attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url', 'is_active', 'is_banned', 'created_at'],
    });

    console.log('📨 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('📨 User data:', JSON.stringify(user.toJSON(), null, 2));
    }

    if (!user) {
      console.warn('⚠️ User not found for landlordId:', landlordId);
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    console.log('✅ Returning user profile successfully');
    return res.status(200).json({
      success: true,
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        isBanned: user.is_banned,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Error in getLandlordProfile:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Full error object:', error);
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/profile
// Update landlord profile
// =========================================================
const updateLandlordProfile = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { fullName, phone } = req.body;

    const user = await User.findOne({
      where: { user_id: landlordId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const updateFields = [];
    const replacements = { userId: landlordId };
    
    if (fullName) {
      updateFields.push('full_name = :fullName');
      replacements.fullName = fullName;
    }
    if (phone) {
      updateFields.push('phone = :phone');
      replacements.phone = phone;
    }
    updateFields.push('updated_at = SYSDATETIMEOFFSET()');

    await sequelize.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = :userId`,
      {
        replacements,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    const updatedUser = await User.findOne({
      where: { user_id: landlordId },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        userId: updatedUser.user_id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/profile/avatar
// Update avatar
// =========================================================
const updateAvatar = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    const user = await User.findOne({
      where: { user_id: landlordId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const avatarUrl = req.file.path;
    await sequelize.query(
      `UPDATE users SET avatar_url = :avatarUrl, updated_at = SYSDATETIMEOFFSET() WHERE user_id = :userId`,
      {
        replacements: { avatarUrl, userId: landlordId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully!',
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/profile/password
// Change password
// =========================================================
const changePassword = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword || newPassword;
    const bcrypt = require('bcrypt');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findOne({
      where: { user_id: landlordId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await sequelize.query(
      `UPDATE users SET password_hash = :passwordHash, updated_at = SYSDATETIMEOFFSET() WHERE user_id = :userId`,
      {
        replacements: { passwordHash: hashedPassword, userId: landlordId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordProfile,
  updateLandlordProfile,
  updateAvatar,
  changePassword,
};
