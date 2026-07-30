const { User } = require('../models');

module.exports = async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: "Access denied. Landlord only." });
  }

  const roleId = String(req.user.roleId || '');
  const roleName = String(req.user.roleName || '').toLowerCase();

  if (roleId !== '2' && roleName !== 'landlord') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Landlord only." 
    });
  }

  try {
    const user = await User.findByPk(req.user.userId);
    if (!user || user.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn chưa được xác thực. Vui lòng hoàn tất xác thực thông tin cá nhân (CCCD) để thực hiện chức năng này."
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
