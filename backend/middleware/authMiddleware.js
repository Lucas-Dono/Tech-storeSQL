const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    console.log('=== Middleware de Autenticación ===');
    console.log('URL:', req.url);
    console.log('Método:', req.method);
    console.log('Headers:', {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'No presente'
    });
    
    let token;

    // Verificar si hay token en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token encontrado en headers');
    }

    if (!token) {
      console.log('No se proporcionó token de autenticación');
      return res.status(401).json({ message: 'No autorizado - Token no proporcionado' });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verificado para el usuario:', decoded.id);

      // Obtener usuario por su ID numérico
      const userId = parseInt(decoded.id);
      if (isNaN(userId)) {
        console.log('ID de usuario inválido en el token');
        return res.status(401).json({ message: 'No autorizado - Token inválido' });
      }

      // Obtener usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        console.log('Usuario no encontrado con el token proporcionado');
        return res.status(401).json({ message: 'No autorizado - Usuario no encontrado' });
      }

      console.log('Usuario encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });

      // Agregar usuario a la request
      req.user = user;
      next();
    } catch (error) {
      console.log('Error al verificar token:', error.message);
      return res.status(401).json({ message: 'No autorizado - Token inválido' });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Middleware para verificar roles
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    console.log('=== Middleware de Autorización ===');
    console.log('Roles permitidos:', roles);
    console.log('Usuario actual:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      isActive: req.user?.isActive
    });

    if (!req.user) {
      console.log('No hay usuario en la request');
      return res.status(401).json({ message: 'No autorizado - Usuario no encontrado' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`Usuario ${req.user.id} con rol ${req.user.role} intentó acceder a ruta protegida para roles:`, roles);
      return res.status(403).json({ 
        message: 'No autorizado - No tiene los permisos necesarios'
      });
    }

    console.log(`Usuario ${req.user.id} autorizado con rol ${req.user.role}`);
    next();
  };
}; 