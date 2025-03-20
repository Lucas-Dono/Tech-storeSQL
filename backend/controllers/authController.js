const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Cambiar estado de un usuario (activo/inactivo)
exports.toggleUserStatus = async (req, res) => {
  try {
    console.log('Intentando cambiar estado del usuario:', {
      userId: req.params.id,
      currentUser: req.user._id,
      currentUserRole: req.user.role
    });

    const user = await User.findById(req.params.id);
    console.log('Usuario encontrado:', user ? {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    } : 'No encontrado');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Prevenir que un admin desactive a un superadmin
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para modificar el estado de un superadmin' 
      });
    }

    // Prevenir que un admin se desactive a sí mismo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'No puedes cambiar tu propio estado' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    console.log('Estado actualizado:', {
      userId: user._id,
      newStatus: user.isActive
    });

    res.json({
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} correctamente`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ message: 'Error al cambiar estado del usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Prevenir eliminación de superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        message: 'No se puede eliminar una cuenta de superadmin' 
      });
    }

    // Prevenir que un usuario se elimine a sí mismo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'No puedes eliminar tu propia cuenta' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// Obtener perfil del usuario actual
exports.getMe = async (req, res) => {
  try {
    console.log('Obteniendo perfil para usuario:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Perfil encontrado:', {
      id: user._id,
      email: user.email,
      role: user.role
    });
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil de usuario' });
  }
}; 