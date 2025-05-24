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
    
    // Extraer solo las URLs de las imágenes
    const imageUrls = results.map(result => result.url);
    res.json({ imageUrls });
  } catch (error) {
    console.error('Error en la subida de imágenes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Eliminar una imagen por su URL
router.delete('/', protect, async (req, res) => {
  try {
    const imageUrl = req.body.url;

    if (!imageUrl) {
      return res.status(400).json({ message: 'No se proporcionó la URL de la imagen' });
    }

    // Extraer el public_id de la URL de Cloudinary
    // Ejemplo URL: http://res.cloudinary.com/cloud_name/image/upload/v12345/folder/image_id.jpg
    const parts = imageUrl.split('/');
    const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;

    if (!publicId) {
      return res.status(400).json({ message: 'No se pudo extraer el ID público de la URL' });
    }

    console.log('Intentando eliminar imagen con public_id:', publicId);
    const result = await deleteFromCloudinary(publicId);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 