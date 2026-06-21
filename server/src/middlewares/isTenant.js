module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: "Access denied. Tenant only." });
  }

  const roleId = String(req.user.roleId || '');
  const roleName = String(req.user.roleName || '').toLowerCase();

  if (roleId !== '3' && roleName !== 'tenant') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Tenant only." 
    });
  }
  next();
};

