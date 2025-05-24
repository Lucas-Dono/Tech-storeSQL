const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const users = await User.find().select('-password');
    console.log('Usuarios encontrados:', JSON.stringify(users, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers(); 