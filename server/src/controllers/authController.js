const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const { sequelize, User, Role, OtpVerification } = require('../models');
const generateOtp = require('../utils/generateOtp');
const sendOtpEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================================================
// POST /api/auth/register
// =========================================================
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required.',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // Find role (DB stores: 'Admin', 'Landlord', 'Tenant')
    const roleName = role || 'Tenant';
    // Map frontend role names to DB role names
    const roleMap = { 'TENANT': 'Tenant', 'LANDLORD': 'Landlord', 'ADMIN': 'Admin' };
    const dbRoleName = roleMap[roleName] || roleName;

    const roleRecord = await Role.findOne({ where: { role_name: dbRoleName } });
    if (!roleRecord) {
      return res.status(400).json({
        success: false,
        message: `Role '${dbRoleName}' not found. Please seed roles first.`,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with is_active = false (will be true after email verification)
    const newUser = await User.create({
      full_name: fullName,
      email: email,
      phone: phone || null,
      password_hash: hashedPassword,
      role_id: roleRecord.role_id,
      is_active: false,
      is_banned: false,
    });

    // Generate OTP and save
    const otpCode = generateOtp();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    await OtpVerification.create({
      user_id: newUser.user_id,
      otp_code: otpCode,
      purpose: 'verify_email',
      expired_at: expiredAt,
    });

    // Send OTP email
    await sendOtpEmail(email, otpCode, 'verify_email');

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      data: {
        userId: newUser.user_id,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/verify-email
// =========================================================
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Find valid OTP
    const otpRecord = await OtpVerification.findOne({
      where: {
        user_id: user.user_id,
        otp_code: otp,
        purpose: 'verify_email',
        is_used: false,
        expired_at: { [Op.gt]: new Date() },
      },
      order: [['otp_id', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    // Activate user
    await user.update({ is_active: true });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/login
// =========================================================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user with role
    const user = await User.findOne({
      where: { email, is_deleted: false },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Contact support.',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        roleId: user.role_id,
        email: user.email,
        roleName: user.role.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Map DB role name to frontend format
    const roleNameMap = { 'Tenant': 'TENANT', 'Landlord': 'LANDLORD', 'Admin': 'ADMIN' };

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          role: roleNameMap[user.role.role_name] || user.role.role_name,
          isActive: user.is_active,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/google
// =========================================================
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required.',
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({
      where: {
        [Op.or]: [{ google_id: googleId }, { email: email }],
        is_deleted: false,
      },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      // Auto-create new user with Tenant role
      const tenantRole = await Role.findOne({ where: { role_name: 'Tenant' } });

      user = await User.create({
        full_name: name,
        email: email,
        google_id: googleId,
        avatar_url: picture,
        role_id: tenantRole.role_id,
        is_active: true, // Google accounts are pre-verified
        is_banned: false,
      });

      // Reload with role association
      user = await User.findOne({
        where: { user_id: user.user_id },
        include: [{ model: Role, as: 'role' }],
      });
    } else if (!user.google_id) {
      // Link Google account to existing user
      await user.update({ google_id: googleId, avatar_url: user.avatar_url || picture });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        roleId: user.role_id,
        email: user.email,
        roleName: user.role.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const roleNameMap = { 'Tenant': 'TENANT', 'Landlord': 'LANDLORD', 'Admin': 'ADMIN' };

    return res.status(200).json({
      success: true,
      message: 'Google login successful!',
      data: {
        token,
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          role: roleNameMap[user.role.role_name] || user.role.role_name,
          isActive: user.is_active,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/forgot-password
// =========================================================
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ where: { email, is_deleted: false } });
    if (!user) {
      // Don't reveal if email exists (security)
      return res.status(200).json({
        success: true,
        message: 'If the email exists, an OTP has been sent.',
      });
    }

    // Generate OTP
    const otpCode = generateOtp();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    await OtpVerification.create({
      user_id: user.user_id,
      otp_code: otpCode,
      purpose: 'forgot_password',
      expired_at: expiredAt,
    });

    // Send email
    await sendOtpEmail(email, otpCode, 'forgot_password');

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/reset-password
// =========================================================
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const user = await User.findOne({ where: { email, is_deleted: false } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify OTP
    const otpRecord = await OtpVerification.findOne({
      where: {
        user_id: user.user_id,
        otp_code: otp,
        purpose: 'forgot_password',
        is_used: false,
        expired_at: { [Op.gt]: new Date() },
      },
      order: [['otp_id', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    // Hash new password and update
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/auth/resend-otp
// =========================================================
const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Email and purpose are required.',
      });
    }

    const user = await User.findOne({ where: { email, is_deleted: false } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Generate new OTP
    const otpCode = generateOtp();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    await OtpVerification.create({
      user_id: user.user_id,
      otp_code: otpCode,
      purpose: purpose,
      expired_at: expiredAt,
    });

    await sendOtpEmail(email, otpCode, purpose);

    return res.status(200).json({
      success: true,
      message: 'New OTP sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  resendOtp,
};
