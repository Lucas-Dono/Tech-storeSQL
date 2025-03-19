const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  createAdminUser,
  deleteUser,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/auth');
const { protect, admin, superadmin } = require('../middleware/auth');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/profile', protect, getUserProfile);
router.post('/create-admin', protect, superadmin, createAdminUser);
router.delete('/users/:id', protect, superadmin, deleteUser);
router.get('/users', protect, superadmin, getAllUsers);
router.patch('/users/:id/role', protect, superadmin, updateUserRole);
router.patch('/users/:id/status', protect, superadmin, toggleUserStatus);

module.exports = router; 