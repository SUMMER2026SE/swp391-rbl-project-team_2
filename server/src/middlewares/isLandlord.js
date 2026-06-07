module.exports = (req, res, next) => {
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
  next();
};
