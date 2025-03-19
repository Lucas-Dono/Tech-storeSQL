import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const ImageCarousel = ({ images, video }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  const items = video ? [...images, 'video'] : images;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (showVideo) {
      setCurrentIndex(items.length - 1);
    }
  }, [showVideo, items.length]);

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
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setShowVideo(items[(currentIndex + 1) % items.length] === 'video');
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    setShowVideo(items[(currentIndex - 1 + items.length) % items.length] === 'video');
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
    setShowVideo(items[index] === 'video');
  };

  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full ${isMobile ? 'h-[300px] sm:h-[400px]' : 'h-[500px]'} rounded-lg overflow-hidden`}
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && setShowControls(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Current Image or Video */}
      {showVideo && video ? (
        <iframe
          className="w-full h-full object-cover"
          src={`https://www.youtube.com/embed/${getVideoId(video)}?autoplay=0&controls=1&modestbranding=1&playsinline=1`}
          title={t('products.videoTitle')}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <img
          src={images[currentIndex]}
          alt={t('products.imageAlt', { number: currentIndex + 1 })}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      )}

      {/* Navigation Arrows - Show always on mobile, on hover for desktop */}
      {(showControls || isMobile) && items.length > 1 && (
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={t('products.goToImage', { number: index + 1 })}
          />
        ))}
      </div>

      {/* Video Indicator */}
      {video && items[currentIndex] === 'video' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {t('products.video')}
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
