const bcrypt = require('bcrypt');
const { User, Role } = require('../models');

// =========================================================
// GET /api/user/profile
// =========================================================
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.userId, is_deleted: false },
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'is_deleted'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const roleNameMap = { 'Tenant': 'TENANT', 'Landlord': 'LANDLORD', 'Admin': 'ADMIN' };

    return res.status(200).json({
      success: true,
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: roleNameMap[user.role.role_name] || user.role.role_name,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/user/profile
// =========================================================
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;

    const user = await User.findOne({
      where: { user_id: req.user.userId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update fields
    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (phone !== undefined) updateData.phone = phone;
    updateData.updated_at = new Date();

    await user.update(updateData);

    // Reload with role
    const updatedUser = await User.findOne({
      where: { user_id: req.user.userId },
      include: [{ model: Role, as: 'role' }],
    });

    const roleNameMap = { 'Tenant': 'TENANT', 'Landlord': 'LANDLORD', 'Admin': 'ADMIN' };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        userId: updatedUser.user_id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url,
        role: roleNameMap[updatedUser.role.role_name] || updatedUser.role.role_name,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/user/avatar
// =========================================================
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const user = await User.findOne({
      where: { user_id: req.user.userId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Build avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatar_url: avatarUrl, updated_at: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully!',
      data: { avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/user/change-password
// =========================================================
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findOne({
      where: { user_id: req.user.userId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Cannot change password.',
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect old password.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash: hashedPassword, updated_at: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
};
