const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { initSuperAdmin } = require('./controllers/auth');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno críticas
console.log('=== Iniciando servidor ===');
console.log('Verificando variables de entorno...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurado' : 'No configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
console.log('CLOUDINARY:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'No configurado');

const requiredEnvVars = [
  'PORT',
  'JWT_SECRET',
  'SUPERADMIN_EMAIL',
  'SUPERADMIN_PASSWORD',
  'SUPERADMIN_NAME',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_CLIENT_ID',
  'DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan las siguientes variables de entorno:', missingEnvVars);
  process.exit(1);
}

// No se requiere conexión previa: Prisma gestiona conexiones por demanda

const app = express();

// Configurar trust proxy para Render
app.set('trust proxy', 1);

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL.replace(/\/$/, '') // Eliminar trailing slash
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Root endpoint for Render health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tech Store API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint (PostgreSQL via Prisma)
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
      database: 'PostgreSQL',
      dbConnection: 'connected',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured',
    uptime: process.uptime()
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  const testResponse = {
    message: 'Test endpoint working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  console.log('Test endpoint called:', testResponse);
  res.json(testResponse);
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Log de rutas registradas
console.log('Rutas registradas:');
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
    }
});

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Middleware de logging de rutas no encontradas
app.use((req, res, next) => {
  console.log('Ruta no encontrada:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// Manejo de errores 404
app.use((req, res) => {
  const error = {
    message: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  };
  console.log('404 Error:', error);
  res.status(404).json(error);
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Error en el servidor' 
      : err.message 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
}); 