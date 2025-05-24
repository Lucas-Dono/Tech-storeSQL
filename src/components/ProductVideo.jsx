import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getYouTubeEmbedUrl } from '../data/products';
import { useTranslation } from 'react-i18next';

const ProductVideo = ({ videoId, thumbnailUrl, onVideoEnd }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hasError || !videoId) return;
    
    setIsLoading(true);
    // Pequeño delay antes de mostrar el video para evitar parpadeos
    timerRef.current = setTimeout(() => {
      setIsPlaying(true);
      // Dar tiempo al iframe para cargar antes de quitar el loader
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  };

  return (
    <div 
      className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Image */}
      <img 
        src={thumbnailUrl}
        alt={t('products.videoThumbnail')}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Video Player */}
      {isPlaying && videoId && !hasError && (
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}>
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={getYouTubeEmbedUrl(videoId)}
            title={t('products.videoTitle')}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleIframeError}
          />
        </div>
      )}

      {/* Play Indicator */}
      {!isPlaying && !isLoading && videoId && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l7-5-7-5z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm">
          {t('products.videoError')}
        </div>
      )}
    </div>
  );
};

ProductVideo.propTypes = {
  videoId: PropTypes.string,
  thumbnailUrl: PropTypes.string.isRequired,
  onVideoEnd: PropTypes.func.isRequired,
};

export default ProductVideo;
