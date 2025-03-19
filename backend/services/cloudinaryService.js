const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file, folder = 'products') => {
  try {
    if (!file) throw new Error('No file provided');

    // Convertir el buffer a base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, crop: "limit" }, // Limitar el ancho máximo
        { quality: "auto" }, // Optimización automática de calidad
        { fetch_format: "auto" } // Formato automático según el navegador
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error al subir la imagen');
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) throw new Error('No public_id provided');
    
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Error al eliminar la imagen');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
}; 