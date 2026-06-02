module.exports = (req, res, next) => {
  if (!req.user || (req.user.roleId !== 2 && req.user.roleName !== 'LANDLORD')) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Landlord only." 
    });
  }
  next();
};
