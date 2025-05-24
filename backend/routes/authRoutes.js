const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  createAdminUser,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  updateUserRole,
  googleLogin
} = require('../controllers/auth');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// Rutas protegidas
router.get('/me', protect, getUserProfile);
router.get('/users', protect, authorize(['admin', 'superadmin']), getAllUsers);
router.post('/users/toggle-status', protect, authorize(['admin', 'superadmin']), toggleUserStatus);
router.delete('/users/:id', protect, authorize(['superadmin']), deleteUser);
router.patch('/users/update-role', protect, authorize(['superadmin']), updateUserRole);
router.post('/create-admin', protect, authorize(['superadmin']), createAdminUser);

module.exports = router; 