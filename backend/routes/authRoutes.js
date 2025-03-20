const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  toggleUserStatus,
  toggleUserStatusFixed,
  deleteUser
} = require('../controllers/authController');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/me', protect, getMe);
router.get('/users', protect, authorize(['admin', 'superadmin']), getAllUsers);
router.post('/users/toggle-status', protect, authorize(['admin', 'superadmin']), toggleUserStatusFixed);
router.delete('/users/:id', protect, authorize(['superadmin']), deleteUser);

module.exports = router; 