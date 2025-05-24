const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, birthDate } = req.body;
    console.log('Datos recibidos en registro:', {
      email,
      tienePassword: !!password,
      longitudPassword: password ? password.length : 0
    });

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Usuario ya existe:', email);
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear usuario (el modelo se encargará de hashear la contraseña)
    const user = await User.create({
      name,
      email,
      password,
      birthDate,
      role: 'user'
    });

    console.log('Usuario creado:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Generar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Error detallado en registro:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Login de usuario
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Datos recibidos en login:', {
      email,
      passwordRecibida: password,
      tienePassword: !!password,
      longitudPassword: password ? password.length : 0
    });

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Usuario encontrado:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordAlmacenada: user.password.substring(0, 10) + '...',
      longitudPasswordAlmacenada: user.password.length
    });

    // Verificar contraseña
    console.log('Intentando comparar contraseñas...');
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Resultado de comparación de contraseña:', isMatch);

      if (!isMatch) {
        console.log('Contraseña incorrecta para usuario:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
    } catch (bcryptError) {
      console.error('Error en la comparación de contraseñas:', bcryptError);
      return res.status(500).json({ message: 'Error en la verificación de credenciales' });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      console.log('Usuario desactivado:', email);
      return res.status(401).json({ message: 'Tu cuenta está desactivada' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('Login exitoso para:', email);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
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

// Obtener todos los usuarios (solo admin y superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Cambiar estado de un usuario (activo/inactivo) - Endpoint fijo
exports.toggleUserStatusFixed = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Intentando cambiar estado del usuario:', {
      userId,
      currentUser: req.user._id,
      currentUserRole: req.user.role
    });

    if (!userId) {
      return res.status(400).json({ message: 'Se requiere el ID del usuario' });
    }

    const user = await User.findById(userId);
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

// Cambiar estado de un usuario (activo/inactivo) - Endpoint con parámetros
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

// Actualizar rol de usuario
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    console.log('Intentando actualizar rol de usuario:', {
      userId,
      newRole: role,
      currentUser: req.user._id,
      currentUserRole: req.user.role
    });

    if (!userId || !role) {
      return res.status(400).json({ message: 'Se requiere el ID del usuario y el nuevo rol' });
    }

    const user = await User.findById(userId);
    console.log('Usuario encontrado:', user ? {
      id: user._id,
      email: user.email,
      currentRole: user.role
    } : 'No encontrado');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar que el rol sea válido
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    // Prevenir cambios en superadmin si no eres superadmin
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para modificar el rol de un superadmin' 
      });
    }

    // Prevenir que un usuario cambie su propio rol
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'No puedes cambiar tu propio rol' 
      });
    }

    user.role = role;
    await user.save();

    console.log('Rol actualizado:', {
      userId: user._id,
      newRole: user.role
    });

    res.json({
      message: `Rol actualizado correctamente a ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error al actualizar rol del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar rol del usuario' });
  }
}; 