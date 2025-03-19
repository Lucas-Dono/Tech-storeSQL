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

    console.log('Intento de registro para:', email);

    if (!name || !email || !password) {
      console.log('Datos faltantes en el registro');
      return res.status(400).json({ 
        message: 'Por favor complete todos los campos',
        received: { name: !!name, email: !!email, password: !!password }
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Usuario ya existe:', email);
      return res.status(400).json({ 
        message: 'El usuario ya existe',
        email: email
      });
    }

    // Determinar el rol basado en el email
    let role = 'user';
    if (email === process.env.SUPERADMIN_EMAIL) {
      console.log('Creando superadmin:', email);
      role = 'superadmin';
    } else if (email === process.env.ADMIN_EMAIL) {
      console.log('Creando admin:', email);
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
      console.log('Usuario creado exitosamente:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

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
    res.status(500).json({ 
      message: 'Error al crear usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Autenticar usuario
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Intento de login para:', email);

    if (!email || !password) {
      console.log('Datos faltantes en el login');
      return res.status(400).json({ 
        message: 'Por favor ingrese email y contraseña',
        received: { email: !!email, password: !!password }
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ 
        message: 'Email o contraseña incorrectos',
        email: email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(401).json({ 
        message: 'Email o contraseña incorrectos',
        email: email
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    console.log('Login exitoso:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    console.log('Obteniendo perfil para usuario:', req.user._id);

    const user = await User.findById(req.user._id);

    if (user) {
      console.log('Perfil encontrado:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      console.log('Perfil no encontrado para:', req.user._id);
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({ 
      message: 'Error al obtener perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear usuario admin o superadmin
// @route   POST /api/auth/create-admin
// @access  Private/Superadmin
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('Intento de crear admin/superadmin:', {
      email,
      role,
      createdBy: req.user._id
    });

    // Verificar que el rol sea válido
    if (role !== 'admin' && role !== 'superadmin') {
      console.log('Rol inválido:', role);
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Solo superadmin puede crear otros superadmins
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de crear superadmin por:', req.user.email);
      return res.status(403).json({ 
        message: 'No autorizado para crear superadmins' 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Usuario ya existe:', email);
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
      console.log('Admin/Superadmin creado:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  } catch (error) {
    console.error('Error en createAdminUser:', error);
    res.status(500).json({ 
      message: 'Error al crear usuario admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Inicializar superadmin desde variables de entorno
// @route   POST /api/auth/init-superadmin
// @access  Private (solo disponible en desarrollo)
const initSuperAdmin = async () => {
  try {
    console.log('Iniciando creación de superadmin...');
    
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    console.log('Buscando superadmin:', superadminEmail);
    
    const superadminExists = await User.findOne({ email: superadminEmail });

    if (!superadminExists) {
      console.log('Superadmin no encontrado, creando...');
      
      const user = await User.create({
        name: process.env.SUPERADMIN_NAME,
        email: process.env.SUPERADMIN_EMAIL,
        password: process.env.SUPERADMIN_PASSWORD,
        role: 'superadmin',
      });

      console.log('Superadmin creado exitosamente:', {
        id: user._id,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('Superadmin ya existe:', {
        id: superadminExists._id,
        email: superadminExists.email,
        role: superadminExists.role
      });
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
    console.log('Intento de eliminar usuario:', req.params.id);

    const user = await User.findById(req.params.id);

    if (!user) {
      console.log('Usuario no encontrado:', req.params.id);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo el superadmin puede eliminar otros superadmins
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de eliminar superadmin por:', req.user.email);
      return res.status(403).json({ 
        message: 'No autorizado para eliminar superadmins' 
      });
    }

    await user.deleteOne();
    console.log('Usuario eliminado:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /auth/users
// @access  Private/Superadmin
const getAllUsers = async (req, res) => {
  try {
    console.log('Iniciando getAllUsers...');
    console.log('Usuario solicitante:', req.user);

    console.log('Buscando usuarios en la base de datos...');
    const users = await User.find({}).select('-password');
    
    console.log(`Se encontraron ${users.length} usuarios:`, users);

    res.json(users);
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  createAdminUser,
  deleteUser,
  getAllUsers,
  initSuperAdmin,
}; 