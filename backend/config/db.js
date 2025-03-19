const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'URI configurada' : 'URI no configurada');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Verificar la conexión
    mongoose.connection.on('connected', () => {
      console.log('Mongoose conectado a MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose desconectado de MongoDB');
    });

  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 