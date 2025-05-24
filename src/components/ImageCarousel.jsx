import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const ImageCarousel = ({ images = [], video = '' }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // DEBUG: Log props recibidas
  console.log('[ImageCarousel] Props received:', { images, video });

  const items = useMemo(() => {
    const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim() !== '') : [];
    return video ? [...validImages, 'video'] : validImages;
  }, [images, video]);

  // DEBUG: Log items calculado
  console.log('[ImageCarousel] Calculated items:', items);

  const isCurrentItemVideo = items[currentIndex] === 'video';

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToNext = () => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrevious = () => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToIndex = (index) => {
    if (items.length === 0 || index < 0 || index >= items.length) return;
    setCurrentIndex(index);
  };

  const getVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = useMemo(() => getVideoId(video), [video]);

  // DEBUG: Log valores clave para renderizado
  console.log('[ImageCarousel] State:', { currentIndex, isCurrentItemVideo, videoId });

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full ${isMobile ? 'h-[300px] sm:h-[400px]' : 'h-[500px]'} rounded-lg overflow-hidden bg-gray-200`}
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && setShowControls(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Current Image or Video */}
      {items.length > 0 ? (
        isCurrentItemVideo && videoId ? (
        <iframe
          className="w-full h-full object-cover"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&playsinline=1`}
          title={t('products.videoTitle')}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <img
            src={items[currentIndex]}
          alt={t('products.imageAlt', { number: currentIndex + 1 })}
          className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => e.target.src = '/placeholder-image.jpg'}
        />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300">
          <span className="text-gray-500">{t('mediaManager.noImage')}</span>
        </div>
      )}

      {/* Navigation Arrows - Show always on mobile, on hover for desktop */}
      {(showControls || isMobile) && items.length > 1 && !isCurrentItemVideo && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${
              isMobile 
                ? 'bg-black bg-opacity-25 active:bg-opacity-50' 
                : 'bg-black bg-opacity-50 hover:bg-opacity-75'
            } transition-all duration-300`}
            aria-label={t('common.previous')}
          >
            <ChevronLeftIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${
              isMobile 
                ? 'bg-black bg-opacity-25 active:bg-opacity-50' 
                : 'bg-black bg-opacity-50 hover:bg-opacity-75'
            } transition-all duration-300`}
            aria-label={t('common.next')}
          >
            <ChevronRightIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center px-3 py-1 rounded-full bg-black bg-opacity-30 gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? item === 'video' ? 'bg-red-500 scale-125' : 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={item === 'video' ? t('products.goToVideo') : t('products.goToImage', { number: index + 1 })}
          />
        ))}
      </div>

      {/* Video Indicator */}
      {isCurrentItemVideo && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          <PlayCircleIcon className="h-4 w-4 inline mr-1"/> {t('products.video')}
        </div>
      )}
    </div>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  video: PropTypes.string
};

export default ImageCarousel;
