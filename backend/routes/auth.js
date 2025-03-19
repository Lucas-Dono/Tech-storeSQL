const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  createAdminUser,
  deleteUser,
} = require('../controllers/auth');
const { protect, admin, superadmin } = require('../middleware/auth');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/profile', protect, getUserProfile);
router.post('/create-admin', protect, superadmin, createAdminUser);
router.delete('/users/:id', protect, superadmin, deleteUser);

module.exports = router; 