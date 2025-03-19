const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401).json({ message: 'No autorizado como administrador' });
  }
};

const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(401).json({ message: 'No autorizado como superadministrador' });
  }
};

// Middleware para verificar permisos de edición
const checkEditPermissions = async (req, res, next) => {
  try {
    const resourceCreator = await User.findById(req.resourceCreatedBy);
    
    // Si el creador es superadmin, solo él puede editar
    if (resourceCreator && resourceCreator.role === 'superadmin') {
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({ 
          message: 'No tienes permisos para editar este recurso' 
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar permisos' });
  }
};

module.exports = { protect, admin, superadmin, checkEditPermissions }; 