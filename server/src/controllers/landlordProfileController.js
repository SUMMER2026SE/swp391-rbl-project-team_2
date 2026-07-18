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
      attributes: [
        'user_id', 'full_name', 'email', 'phone', 'avatar_url', 
        'ic_number', 'ic_issue_date', 'ic_issue_place', 'permanent_address', 
        'is_active', 'is_banned', 'created_at',
        'cccd_front_url', 'cccd_back_url', 'face_photo_url', 
        'verification_status', 'verification_notes'
      ],
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
        icNumber: user.ic_number,
        icIssueDate: user.ic_issue_date,
        icIssuePlace: user.ic_issue_place,
        permanentAddress: user.permanent_address,
        isActive: user.is_active,
        isBanned: user.is_banned,
        createdAt: user.created_at,
        cccdFrontUrl: user.cccd_front_url,
        cccdBackUrl: user.cccd_back_url,
        facePhotoUrl: user.face_photo_url,
        verificationStatus: user.verification_status,
        verificationNotes: user.verification_notes,
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
    const { fullName, phone, icNumber, icIssueDate, icIssuePlace, permanentAddress } = req.body;

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
    
    let identityChanged = false;

    if (fullName && fullName !== user.full_name) {
      updateFields.push('full_name = :fullName');
      replacements.fullName = fullName;
      identityChanged = true;
    }
    if (phone && phone !== user.phone) {
      updateFields.push('phone = :phone');
      replacements.phone = phone;
    }
    if (icNumber !== undefined && icNumber !== user.ic_number) {
      updateFields.push('ic_number = :icNumber');
      replacements.icNumber = icNumber || null;
      identityChanged = true;
    }
    
    const formatDate = (d) => {
      if (!d) return null;
      try {
        return new Date(d).toISOString().split('T')[0];
      } catch (e) {
        return null;
      }
    };

    if (icIssueDate !== undefined) {
      const formattedInput = formatDate(icIssueDate);
      const formattedDb = formatDate(user.ic_issue_date);
      if (formattedInput !== formattedDb) {
        updateFields.push('ic_issue_date = :icIssueDate');
        replacements.icIssueDate = icIssueDate || null;
        identityChanged = true;
      }
    }
    if (icIssuePlace !== undefined && icIssuePlace !== user.ic_issue_place) {
      updateFields.push('ic_issue_place = :icIssuePlace');
      replacements.icIssuePlace = icIssuePlace || null;
      identityChanged = true;
    }
    if (permanentAddress !== undefined && permanentAddress !== user.permanent_address) {
      updateFields.push('permanent_address = :permanentAddress');
      replacements.permanentAddress = permanentAddress || null;
      identityChanged = true;
    }

    if (identityChanged) {
      updateFields.push("verification_status = 'unverified'");
      updateFields.push("verification_notes = NULL");
    }

    updateFields.push('updated_at = SYSDATETIMEOFFSET()');

    if (updateFields.length > 1) { // more than just updated_at
      await sequelize.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = :userId`,
        {
          replacements,
          type: sequelize.QueryTypes.UPDATE
        }
      );
    }

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
        icNumber: updatedUser.ic_number,
        icIssueDate: updatedUser.ic_issue_date,
        icIssuePlace: updatedUser.ic_issue_place,
        permanentAddress: updatedUser.permanent_address,
        verificationStatus: updatedUser.verification_status,
        verificationNotes: updatedUser.verification_notes,
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

// =========================================================
// POST /api/landlord/profile/verify
// Submit Landlord identity verification
// =========================================================
const submitVerification = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { icNumber, icIssueDate, icIssuePlace, permanentAddress } = req.body;

    const user = await User.findOne({
      where: { user_id: landlordId, is_deleted: false },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.verification_status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu xác thực của bạn đang chờ duyệt. Không thể gửi thêm yêu cầu.',
      });
    }

    if (user.verification_status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản của bạn đã được xác thực thành công.',
      });
    }

    // Check uploaded files
    const cccdFrontFile = req.files && req.files['cccdFront'] ? req.files['cccdFront'][0] : null;
    const cccdBackFile = req.files && req.files['cccdBack'] ? req.files['cccdBack'][0] : null;
    const facePhotoFile = req.files && req.files['facePhoto'] ? req.files['facePhoto'][0] : null;

    if (!cccdFrontFile || !cccdBackFile || !facePhotoFile) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: Mặt trước CCCD, Mặt sau CCCD và Ảnh chân dung.',
      });
    }

    if (!icNumber || !icIssueDate || !icIssuePlace || !permanentAddress) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin CCCD (Số CCCD, Ngày cấp, Nơi cấp, Địa chỉ thường trú).',
      });
    }

    const cccdFrontUrl = cccdFrontFile.path;
    const cccdBackUrl = cccdBackFile.path;
    const facePhotoUrl = facePhotoFile.path;

    await sequelize.query(
      `UPDATE users SET 
        ic_number = :icNumber, 
        ic_issue_date = :icIssueDate, 
        ic_issue_place = :icIssuePlace, 
        permanent_address = :permanentAddress,
        cccd_front_url = :cccdFrontUrl,
        cccd_back_url = :cccdBackUrl,
        face_photo_url = :facePhotoUrl,
        verification_status = 'pending',
        verification_notes = NULL,
        updated_at = SYSDATETIMEOFFSET()
       WHERE user_id = :userId`,
      {
        replacements: {
          icNumber,
          icIssueDate,
          icIssuePlace,
          permanentAddress,
          cccdFrontUrl,
          cccdBackUrl,
          facePhotoUrl,
          userId: landlordId
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Hồ sơ xác thực đã được gửi đi thành công! Vui lòng chờ quản trị viên duyệt.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/profile/ocr
// Scan CCCD automatically
// =========================================================
const scanOcr = async (req, res, next) => {
  try {
    const cccdFrontFile = req.files && req.files['cccdFront'] ? req.files['cccdFront'][0] : null;
    const cccdBackFile = req.files && req.files['cccdBack'] ? req.files['cccdBack'][0] : null;

    if (!cccdFrontFile || !cccdBackFile) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp cả 2 mặt CCCD để quét.',
      });
    }

    const OcrService = require('../services/ocrService');
    const result = await OcrService.scanCCCD(cccdFrontFile.path, cccdBackFile.path);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordProfile,
  updateLandlordProfile,
  updateAvatar,
  changePassword,
  submitVerification,
  scanOcr,
};
