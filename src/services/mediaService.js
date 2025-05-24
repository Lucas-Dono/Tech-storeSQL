import imageCompression from 'browser-image-compression';
import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

// Constantes para validación de archivos
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Función auxiliar para convertir File a Data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Función para validar si una URL es válida
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Función para comprimir imágenes
const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    return file;
  }
};

export const mediaService = {
  async uploadImages(files, token) {
    try {
      const imageFiles = Array.from(files).filter(file => 
        ALLOWED_IMAGE_TYPES.includes(file.type)
      );

      const formData = new FormData();
      
      for (const file of imageFiles) {
        const compressedFile = await compressImage(file);
        if (compressedFile.size > MAX_IMAGE_SIZE) {
          throw new Error(`La imagen ${file.name} es demasiado grande. Máximo 5MB.`);
        }
        formData.append('images', compressedFile);
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.UPLOAD_IMAGES}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir las imágenes');
      }

      const data = await response.json();
      // Asegurarnos de que data.imageUrls sea un array
      const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [data.imageUrls];
      return imageUrls;
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      throw error;
    }
  },

  async uploadVideo(file, token) {
    try {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('Formato de video no soportado');
      }

      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error('El video es demasiado grande. Máximo 100MB.');
      }

      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_URL}${ENDPOINTS.UPLOAD_VIDEO}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir el video');
      }

      const data = await response.json();
      return data.videoUrl;
    } catch (error) {
      console.error('Error al subir el video:', error);
      throw error;
    }
  },

  async deleteMedia(mediaUrl, token) {
    try {
      if (!mediaUrl) {
        throw new Error('URL no proporcionada');
      }

      // Si mediaUrl es un objeto, extraer la URL
      const urlToDelete = typeof mediaUrl === 'object' ? mediaUrl.url : mediaUrl;

      // Si es una URL de blob, ignorar la eliminación y retornar éxito
      if (urlToDelete.startsWith('blob:')) {
        console.log('URL de blob detectada, no se requiere eliminación del servidor');
        return;
      }

      // Verificar que sea una URL válida
      if (!isValidUrl(urlToDelete)) {
        throw new Error('URL inválida');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.DELETE_MEDIA}`, {
        method: 'DELETE',
        headers: getHeaders(token),
        body: JSON.stringify({ url: urlToDelete })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el archivo multimedia');
      }
    } catch (error) {
      console.error('Error en deleteMedia:', error);
      throw error;
    }
  }
}; 