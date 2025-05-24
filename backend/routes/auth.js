const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  createAdminUser,
  deleteUser,
  getAllUsers,
  updateUserRole,
  toggleUserStatus
} = require('../controllers/auth');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// Rutas privadas
router.get('/me', protect, getUserProfile);

// Rutas para administradores
router.get('/users', protect, admin, getAllUsers);
router.post('/create-admin', protect, superadmin, createAdminUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/update-role', protect, admin, updateUserRole);
router.post('/users/toggle-status', protect, admin, toggleUserStatus);

module.exports = router; 