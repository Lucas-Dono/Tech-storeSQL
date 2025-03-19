const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSuperAdmin } = require('./controllers/auth');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar superadmin si no existe
if (process.env.NODE_ENV === 'development') {
  initSuperAdmin();
}

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: '*', // Temporalmente permitimos todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // límite más estricto en producción
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
  console.log('CORS habilitado para todos los orígenes');
}); 