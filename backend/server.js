const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { initSuperAdmin } = require('./controllers/auth');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno críticas
console.log('=== Iniciando servidor ===');
console.log('Verificando variables de entorno...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurado' : 'No configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan las siguientes variables de entorno:', missingEnvVars);
  process.exit(1);
}

// Conectar a la base de datos
console.log('Intentando conectar a MongoDB...');
connectDB().then(() => {
  console.log('MongoDB conectado exitosamente');
}).catch(err => {
  console.error('Error al conectar MongoDB:', err);
  process.exit(1);
});

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Configuración de CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host
    },
    uptime: process.uptime()
  };
  
  console.log('Health check:', health);
  res.status(200).json(health);
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

// Rutas de autenticación
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

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