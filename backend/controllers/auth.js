const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// Cliente de Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

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

    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
      name,
      email,
        password: hashedPassword,
      role,
      }
    });

    if (user) {
      console.log('Usuario creado exitosamente:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
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

// @desc    Autenticar usuario con Google
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Token de Google no proporcionado' });
    }

    // Verificar el token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ message: 'Token de Google inválido' });
    }

    const { email, name, picture, sub: googleId } = payload;

    console.log('Intento de login con Google para:', email);

    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    // Verificar si el usuario ya existe
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Si el usuario no existe, lo creamos
    if (!user) {
      console.log('Creando nuevo usuario desde Google:', email);
      
      // Determinar el rol basado en el email
      let role = 'user';
      if (email === process.env.SUPERADMIN_EMAIL) {
        console.log('Creando superadmin desde Google:', email);
        role = 'superadmin';
      } else if (email === process.env.ADMIN_EMAIL) {
        console.log('Creando admin desde Google:', email);
        role = 'admin';
      }

      // Crear un password aleatorio que no se usará (el usuario siempre iniciará con Google)
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          googleId,
          image: picture,
          role,
        }
      });

      console.log('Usuario creado desde Google exitosamente:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
    } else {
      // Si el usuario ya existe pero no tiene googleId, actualizamos su perfil
      if (!user.googleId) {
        console.log('Actualizando usuario existente con datos de Google:', email);
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            image: picture || user.image,
            // No actualizamos el nombre para mantener el que eligió el usuario al registrarse
          }
        });
      }
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    console.log('Login con Google exitoso:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Error en googleLogin:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión con Google',
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

    const user = await prisma.user.findUnique({
      where: { email }
    });

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
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    console.log('Login exitoso:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
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
    console.log('Obteniendo perfil para usuario:', req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (user) {
      console.log('Perfil encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      console.log('Perfil no encontrado para:', req.user.id);
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
      createdBy: req.user.id
    });

    // Verificar que el rol sea válido
    if (role !== 'admin' && role !== 'superadmin') {
      console.log('Rol inválido:', role);
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Solo superadmin puede crear otros superadmins
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de crear superadmin por:', req.user.id);
      return res.status(403).json({ message: 'No autorizado para crear superadmin' });
    }

    // Verificar si el usuario ya existe
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      console.log('Usuario ya existe:', email);
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario con referencia al creador
    const user = await prisma.user.create({
      data: {
      name,
      email,
        password: hashedPassword,
      role,
        createdById: req.user.id
      }
    });

    console.log('Admin/superadmin creado:', {
      id: user.id,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
      id: user.id,
        name: user.name,
        email: user.email,
      role: user.role
      });
  } catch (error) {
    console.error('Error en createAdminUser:', error);
    res.status(500).json({ 
      message: 'Error al crear usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Inicializar superadmin y admin
// @desc    Esta función se llama al inicio del servidor
const initSuperAdmin = async () => {
  try {
    if (!process.env.SUPERADMIN_EMAIL || !process.env.SUPERADMIN_PASSWORD) {
      console.warn('Variables de entorno para superadmin no configuradas, saltando inicialización');
      return;
    }

    console.log('Verificando si existe superadmin...');

    // Verificar si ya existe un superadmin
    const superadminExists = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    });

    if (superadminExists) {
      console.log('Superadmin ya existe, saltando inicialización');
    } else {
    console.log('Creando superadmin inicial...');

    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, salt);

    // Crear superadmin
    const superadmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: process.env.SUPERADMIN_EMAIL,
        password: hashedPassword,
        role: 'superadmin'
      }
      });

    console.log('Superadmin inicial creado:', {
      id: superadmin.id,
      email: superadmin.email
      });
    }

    // Inicializar admin
    await initAdmin();
  } catch (error) {
    console.error('Error al inicializar superadmin:', error);
  }
};

// @desc    Inicializar admin
const initAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('Variables de entorno para admin no configuradas, saltando inicialización');
      return;
    }

    console.log('Verificando si existe admin...');

    // Verificar si ya existe un admin
    const adminExists = await prisma.user.findFirst({
      where: { 
        email: process.env.ADMIN_EMAIL,
        role: 'admin'
      }
    });

    if (adminExists) {
      console.log('Admin ya existe, saltando inicialización');
      return;
    }

    console.log('Creando admin inicial...');

    // Generar salt y hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    // Crear admin
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('Admin inicial creado:', {
      id: admin.id,
      email: admin.email
    });
  } catch (error) {
    console.error('Error al inicializar admin:', error);
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    console.log('Intento de eliminar usuario:', userId, 'por', req.user.id);

    // Verificar que no se elimine a sí mismo
    if (userId === req.user.id) {
      console.log('Intento de auto-eliminación no permitido');
      return res.status(400).json({ message: 'No puede eliminar su propio usuario' });
    }

    // Obtener el usuario a eliminar
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToDelete) {
      console.log('Usuario a eliminar no encontrado:', userId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo superadmin puede eliminar superadmins
    if (userToDelete.role === 'superadmin' && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de eliminar superadmin');
      return res.status(403).json({ message: 'No autorizado para eliminar superadmin' });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log('Usuario eliminado exitosamente:', userId);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('Obteniendo todos los usuarios por:', req.user.id);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });
    
    console.log(`Encontrados ${users.length} usuarios`);
    res.json(users);
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar rol de usuario
// @route   PUT /api/auth/users/update-role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    console.log('Intento de actualizar rol:', {
      userId: parsedUserId,
      newRole,
      by: req.user.id
    });

    // Verificar que el rol sea válido
    if (newRole !== 'user' && newRole !== 'admin' && newRole !== 'superadmin') {
      console.log('Rol inválido:', newRole);
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Obtener el usuario a actualizar
    const userToUpdate = await prisma.user.findUnique({
      where: { id: parsedUserId }
    });

    if (!userToUpdate) {
      console.log('Usuario a actualizar no encontrado:', parsedUserId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo superadmin puede actualizar superadmins o convertir a alguien en superadmin
    if ((userToUpdate.role === 'superadmin' || newRole === 'superadmin') && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de actualizar a/desde superadmin');
      return res.status(403).json({ message: 'No autorizado para esta operación' });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: { role: newRole }
    });

    console.log('Rol actualizado exitosamente:', {
      userId: parsedUserId,
      oldRole: userToUpdate.role,
      newRole
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error en updateUserRole:', error);
    res.status(500).json({ 
      message: 'Error al actualizar rol',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cambiar estado de usuario (activo/inactivo)
// @route   PUT /api/auth/users/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    console.log('Intento de cambiar estado de usuario:', {
      userId: parsedUserId,
      by: req.user.id
    });

    // Obtener el usuario a actualizar
    const userToUpdate = await prisma.user.findUnique({
      where: { id: parsedUserId }
    });

    if (!userToUpdate) {
      console.log('Usuario a actualizar no encontrado:', parsedUserId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo superadmin puede cambiar estado de superadmins
    if (userToUpdate.role === 'superadmin' && req.user.role !== 'superadmin') {
      console.log('Intento no autorizado de cambiar estado de superadmin');
      return res.status(403).json({ message: 'No autorizado para esta operación' });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: { isActive: !userToUpdate.isActive }
    });

    console.log('Estado actualizado exitosamente:', {
      userId: parsedUserId,
      isActive: updatedUser.isActive
    });
    
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    console.error('Error en toggleUserStatus:', error);
    res.status(500).json({ 
      message: 'Error al cambiar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  createAdminUser,
  initSuperAdmin,
  deleteUser,
  getAllUsers,
  updateUserRole,
  toggleUserStatus
}; 