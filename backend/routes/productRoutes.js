const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, authorize(['admin', 'superadmin']), createProduct);
router.put('/:id', protect, authorize(['admin', 'superadmin']), updateProduct);
router.delete('/:id', protect, authorize(['admin', 'superadmin']), deleteProduct);

module.exports = router; 