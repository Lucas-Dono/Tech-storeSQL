import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { mediaService } from '../../services/mediaService';
import { useAlert } from '../../context/AlertContext';
import { useTranslation } from 'react-i18next';

const MediaManager = ({ images = [], video, onImagesChange, onVideoChange }) => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(null);
  const [videoUrl, setVideoUrl] = useState(video?.url || '');
  const [isUploading, setIsUploading] = useState(false);

  const MAX_IMAGES = 7;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > MAX_IMAGES) {
      error(t('mediaManager.maxImagesError', { max: MAX_IMAGES }));
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls = await mediaService.uploadImages(files);
      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);
      success(t('mediaManager.imageUploadSuccess'));
    } catch (err) {
      error(t('mediaManager.imageUploadError'));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async (index) => {
    try {
      const imageUrl = images[index];
      await mediaService.deleteMedia(imageUrl);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      success(t('mediaManager.imageDeleteSuccess'));
    } catch (err) {
      error(t('mediaManager.imageDeleteError'));
      console.error(err);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setIsDraggingOver(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(null);
    setIsDraggingOver(null);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      onVideoChange({ file, type: 'file' });
    }
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (url) {
      onVideoChange({ url, type: 'url' });
    } else {
      onVideoChange(null);
    }
  };

  const getVideoThumbnail = useCallback(() => {
    if (videoUrl) {
      // Extraer ID de video de YouTube
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/0.jpg`;
      }
    }
    return null;
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      {/* Sección de imágenes */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('mediaManager.productImages')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('mediaManager.addImages')}
            </label>
            <label className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none ${isUploading ? 'cursor-wait' : 'cursor-pointer hover:border-blue-500'} focus:outline-none`}>
              <span className="flex items-center space-x-2">
                {isUploading ? (
                  <svg className="w-6 h-6 text-gray-400 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                <span className="font-medium text-gray-600">
                  {isUploading ? t('mediaManager.uploading') : t('mediaManager.selectImages')}
                </span>
              </span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.gif"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Grid de imágenes */}
          {images.map((imageUrl, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                isDraggingOver === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={imageUrl}
                alt={t('products.imageAlt', { number: index + 1 })}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all">
                <button
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-sm transition-colors z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    {t('mediaManager.position', { position: index + 1 })}
                  </span>
                  <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    {t('mediaManager.dragToReorder')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {t('mediaManager.maxImages', { max: MAX_IMAGES })}
        </p>
      </div>

      {/* Sección de video */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('mediaManager.productVideo')}</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('mediaManager.videoUrl')}
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                value={videoUrl}
                onChange={handleVideoUrlChange}
                placeholder={t('mediaManager.videoUrlPlaceholder')}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {videoUrl && (
                <button
                  onClick={() => {
                    setVideoUrl('');
                    onVideoChange(null);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {videoUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || ''}`}
                  title={t('mediaManager.videoTitle')}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MediaManager.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  video: PropTypes.shape({
    url: PropTypes.string,
    type: PropTypes.oneOf(['url', 'file'])
  }),
  onImagesChange: PropTypes.func.isRequired,
  onVideoChange: PropTypes.func.isRequired
};

export default MediaManager; 