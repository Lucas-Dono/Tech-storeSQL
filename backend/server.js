const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { initSuperAdmin } = require('./controllers/auth');
const mongoose = require('mongoose');

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno...');
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Faltan las siguientes variables de entorno:', missingEnvVars);
  process.exit(1);
}

console.log('Variables de entorno verificadas correctamente');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Conectar a la base de datos
connectDB();

// Inicializar superadmin si no existe
if (process.env.NODE_ENV === 'development') {
  initSuperAdmin();
}

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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
  res.status(200).json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', require('./routes/auth'));

// Manejo de errores 404
app.use((req, res) => {
  console.log(`404 - Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Ruta no encontrada' });
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

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
  console.log('CORS habilitado para todos los orígenes');
}); 