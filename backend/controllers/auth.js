const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Determinar el rol basado en el email
    let role = 'user';
    if (email === process.env.SUPERADMIN_EMAIL) {
      role = 'superadmin';
    } else if (email === process.env.ADMIN_EMAIL) {
      role = 'admin';
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Error en registerUser:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// @desc    Autenticar usuario
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

// @desc    Crear usuario admin o superadmin
// @route   POST /api/auth/create-admin
// @access  Private/Superadmin
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar que el rol sea válido
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Solo superadmin puede crear otros superadmins
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'No autorizado para crear superadmins' 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      createdBy: req.user._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario admin' });
  }
};

// @desc    Inicializar superadmin desde variables de entorno
// @route   POST /api/auth/init-superadmin
// @access  Private (solo disponible en desarrollo)
const initSuperAdmin = async () => {
  try {
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminExists = await User.findOne({ email: superadminEmail });

    if (!superadminExists) {
      await User.create({
        name: process.env.SUPERADMIN_NAME,
        email: process.env.SUPERADMIN_EMAIL,
        password: process.env.SUPERADMIN_PASSWORD,
        role: 'superadmin',
      });
      console.log('Superadmin creado exitosamente');
    }
  } catch (error) {
    console.error('Error al crear superadmin:', error);
  }
};

// @desc    Eliminar usuario
// @route   DELETE /auth/users/:id
// @access  Private/Superadmin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo el superadmin puede eliminar otros superadmins
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'No autorizado para eliminar superadmins' 
      });
    }

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  createAdminUser,
  initSuperAdmin,
  deleteUser,
}; 