import imageCompression from 'browser-image-compression';

// Constantes para validación de archivos
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const API_URL = 'http://localhost:3001/api';

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

export const compressImage = async (imageFile) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  };
  
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return new File([compressedFile], 
      `${imageFile.name.split('.')[0]}.webp`,
      { type: 'image/webp' }
    );
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    return imageFile;
  }
};

export const mediaService = {
  async uploadImages(files) {
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

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir las imágenes');
      }

      const data = await response.json();
      return data.imageUrls; // Array de URLs de las imágenes subidas
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      throw error;
    }
  },

  async uploadVideo(file) {
    try {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('Formato de video no soportado');
      }

      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error('El video es demasiado grande. Máximo 100MB.');
      }

      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_URL}/upload/video`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir el video');
      }

      const data = await response.json();
      return data.videoUrl;
    } catch (error) {
      console.error('Error al subir el video:', error);
      throw error;
    }
  },

  async deleteMedia(mediaUrl) {
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

      // Verificar que sea una URL válida del servidor
      if (!urlToDelete || !urlToDelete.includes('http://localhost:3001/uploads/')) {
        throw new Error('URL inválida. Debe ser una URL del servidor.');
      }

      console.log('Intentando eliminar:', urlToDelete);

      const response = await fetch(`${API_URL}/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(urlToDelete)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al eliminar el archivo multimedia');
      }

      console.log('Archivo eliminado correctamente');
    } catch (error) {
      console.error('Error en deleteMedia:', error);
      throw error;
    }
  }
}; 