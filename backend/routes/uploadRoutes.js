const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// Subir una sola imagen
router.post('/single', protect, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    const result = await uploadToCloudinary(req.file);
    res.json(result);
  } catch (error) {
    console.error('Error en la subida de imagen:', error);
    res.status(500).json({ message: error.message });
  }
});

// Subir múltiples imágenes
router.post('/multiple', protect, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    
    res.json(results);
  } catch (error) {
    console.error('Error en la subida de imágenes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Eliminar una imagen
router.delete('/:public_id', protect, async (req, res) => {
  try {
    const result = await deleteFromCloudinary(req.params.public_id);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 