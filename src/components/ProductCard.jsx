import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import ProductVideo from './ProductVideo';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useStore();
  const [currentPrice, setCurrentPrice] = useState(
    typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice
  );
  const [currentStock, setCurrentStock] = useState(
    typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock
  );
  const [currentImage, setCurrentImage] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const imageToUse = Array.isArray(product.images) && product.images.length > 0 
      ? product.images[0] 
      : (typeof product.image === 'string' ? product.image : '');
    
    setCurrentImage(imageToUse || '/placeholder-image.jpg');
    setImageError(false);
  }, [product.images, product.image]);

  const handleImageError = () => {
    setImageError(true);
    setCurrentImage('/placeholder-image.jpg');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStock <= 0) {
      return;
    }
    
    setIsAdding(true);
    
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: currentImage || product.image,
      stock: currentStock,
      category: product.category,
      selectedOptions: {}
    };

    setTimeout(() => {
      addToCart(productToAdd, 1);
      setIsAdding(false);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      if (product.videoUrl || product.video) {
        setShowVideo(true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      setShowVideo(false);
    }
  };

  const handleVideoEnd = () => {
    setShowVideo(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <div 
      className="relative bg-white rounded-lg shadow-md overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botones de edición y eliminación */}
      {onEdit && onDelete && (
        <div className="absolute top-2 left-2 flex space-x-2 z-10">
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <Link to={`/producto/${product.id}`} className="block">
        {/* Imagen o Video del producto */}
        <div className="relative h-48 overflow-hidden">
          {showVideo && (product.videoUrl || product.video) ? (
            <ProductVideo
              videoUrl={product.videoUrl}
              video={product.video}
              thumbnailUrl={currentImage}
              onVideoEnd={handleVideoEnd}
            />
          ) : (
            <img
              src={currentImage || '/placeholder-image.jpg'}
              alt={product.name}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered && !isMobile ? 'scale-110' : 'scale-100'
              }`}
            />
          )}
          {/* Badge de categoría */}
          <div className="absolute top-2 right-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>
          
          {/* Badge de stock */}
          {currentStock <= 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                {t('products.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          
          {/* Precio */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
            {currentStock > 0 && (
              <span className="text-sm text-gray-500">
                {t('products.availableStock', { stock: currentStock })}
              </span>
            )}
          </div>

          {/* Botón de agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0 || isAdding}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              currentStock <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isAdding ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('products.addingToCart')}
              </span>
            ) : (
              <span className="flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {t('products.addToCart')}
              </span>
            )}
          </button>
        </div>
      </Link>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    basePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    videoUrl: PropTypes.string,
    video: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default ProductCard;
