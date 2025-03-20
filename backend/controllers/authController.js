// Cambiar estado de un usuario (activo/inactivo)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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