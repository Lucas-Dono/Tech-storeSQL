const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    console.log('Headers recibidos:', req.headers);

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      console.log('No se encontró token en el header');
      return res.status(401).json({ message: 'No autorizado, no hay token' });
    }

    // Obtener token del header
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token extraído:', token);

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id).select('-password');
    console.log('Usuario encontrado:', req.user);

    if (!req.user) {
      console.log('Usuario no encontrado en la base de datos');
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    res.status(401).json({ 
      message: 'No autorizado, token fallido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  console.log('Verificando permisos de superadmin para:', req.user);
  
  if (req.user && req.user.role === 'superadmin') {
    console.log('Usuario confirmado como superadmin');
    next();
  } else {
    console.log('Acceso denegado - No es superadmin:', req.user?.role);
    res.status(401).json({ 
      message: 'No autorizado como superadministrador',
      userRole: req.user?.role
    });
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