import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAdmin } from '../context/AdminContext';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/productService';
import Loading from '../components/Loading';
import ImageCarousel from '../components/ImageCarousel';
import ProductComparison from '../components/ProductComparison';
import ProductCard from '../components/ProductCard';
import React from 'react';
import { productComparisonService } from '../services/productComparisonService';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { InformationCircleIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, CpuChipIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { error, success } = useAlert();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();
  const { products } = useAdmin();
  const [showComparisonModal, setShowComparisonModal] = useState(true);
  const [comparableProducts, setComparableProducts] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Procesar los componentes configurados de manera más segura
  const configuredComponents = React.useMemo(() => {
    if (!product || !product.features || typeof product.features !== 'object') {
      return [];
    }

    try {
      const features = product.features;
      console.log('Raw features data:', features);
      
      return Object.entries(features)
        .filter(([category, data]) => {
          // Verificar que data existe y tiene la estructura esperada
          return data && 
                 typeof data === 'object' && 
                 (data.selectedComponent || data.selectedComponents);
        })
        .map(([category, data]) => {
          // Manejar tanto selectedComponent como selectedComponents
          if (data.selectedComponents) {
            return {
              category: String(category),
              components: data.selectedComponents.map(component => ({
                name: component.name || component.label || component.value || 'Sin nombre',
                description: component.description ? String(component.description) : null,
                price: component.price ? Number(component.price) : null
              }))
            };
          } else {
            const component = data.selectedComponent;
            return {
              category: String(category),
              component: {
                name: component.name || component.label || component.value || 'Sin nombre',
                description: component.description ? String(component.description) : null,
                price: component.price ? Number(component.price) : null
              }
            };
          }
        });
    } catch (error) {
      console.error('Error processing configured components:', error);
      return [];
    }
  }, [product]);

  // Función helper para renderizar traducciones de manera segura
  const safeTranslate = React.useCallback((key, options = {}) => {
    try {
      const result = t(key, options);
      
      // Si el resultado es un objeto (como {en: "text", es: "texto"}), extraer el valor correcto
      if (typeof result === 'object' && result !== null) {
        console.error('Translation returned object for key:', key, 'Result:', result);
        
        // Intentar obtener la traducción para el idioma actual
        const currentLang = i18n.language;
        if (result[currentLang]) {
          return result[currentLang];
        }
        
        // Fallback a español si existe
        if (result.es) {
          return result.es;
        }
        
        // Fallback a inglés si existe
        if (result.en) {
          return result.en;
        }
        
        // Si no hay nada útil, usar el defaultValue o la key
        return options.defaultValue || key.split('.').pop() || key;
      }
      
      // Si es una cadena, devolverla tal como está
      if (typeof result === 'string') {
        return result;
      }
      
      // Para cualquier otro tipo, usar el fallback
      console.warn('Unexpected translation result type:', typeof result, 'for key:', key);
      return options.defaultValue || key.split('.').pop() || key;
      
    } catch (err) {
      console.error('Translation error for key:', key, 'Error:', err);
      return options.defaultValue || key.split('.').pop() || key;
    }
  }, [t, i18n.language]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const foundProduct = await productService.getProductById(id);
        
        if (!foundProduct) {
          error(t('productDetail.notFound'));
          navigate('/productos');
          return;
        }
        
        // Procesar el producto para asegurar que tenga la estructura correcta
        const processedProduct = {
          ...foundProduct,
          id: foundProduct._id || foundProduct.id,
          images: Array.isArray(foundProduct.images) 
            ? foundProduct.images.filter(img => typeof img === 'string')
            : [],
          video: (foundProduct.video && typeof foundProduct.video === 'object' && foundProduct.video.url) 
                 ? foundProduct.video.url 
                 : (typeof foundProduct.video === 'string' ? foundProduct.video : ''), // Fallback por si acaso
          specifications: foundProduct.specifications || {}
        };

        console.log('Processed product:', processedProduct); // Para depuración
        setProduct(processedProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        error(t('productDetail.error'));
        navigate('/productos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, error, navigate, t]);

  useEffect(() => {
    if (product && product.id) {
      setLoadingComparison(true);
      productComparisonService.getComparableProducts(product.id)
        .then(setComparableProducts)
        .finally(() => setLoadingComparison(false));
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    const productToAdd = {
      ...product,
      selectedOptions,
      quantity
    };

    addToCart(productToAdd);
    success(t('products.addedToCart', {
      quantity,
      unit: quantity === 1 ? t('products.unit') : t('products.units'),
      name: product.name
    }));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const getLocalizedDescription = () => {
    if (!product) return '';
    return i18n.language === 'en' && product.description_en
      ? product.description_en
      : product.description;
  };

  // Función para calcular la similitud entre productos basada en componentes
  const calculateProductSimilarity = React.useCallback((product1, product2) => {
    if (!product1.features || !product2.features) return 0;
    
    let similarityScore = 0;
    let totalComponents = 0;
    
    // Comparar categorías de componentes
    const categories1 = Object.keys(product1.features);
    const categories2 = Object.keys(product2.features);
    
    categories1.forEach(category => {
      if (categories2.includes(category)) {
        totalComponents++;
        const comp1 = product1.features[category]?.selectedComponent;
        const comp2 = product2.features[category]?.selectedComponent;
        
        if (comp1 && comp2) {
          // Comparar por ranking si existe
          const ranking1 = comp1.ranking || 5;
          const ranking2 = comp2.ranking || 5;
          const rankingDiff = Math.abs(ranking1 - ranking2);
          
          // Puntuación basada en diferencia de ranking (menor diferencia = mayor similitud)
          const rankingScore = Math.max(0, 10 - rankingDiff * 2);
          
          // Comparar por precio si existe
          const price1 = comp1.price || 0;
          const price2 = comp2.price || 0;
          const priceDiff = price1 > 0 && price2 > 0 ? Math.abs(price1 - price2) / Math.max(price1, price2) : 0;
          const priceScore = Math.max(0, 10 - priceDiff * 10);
          
          similarityScore += (rankingScore + priceScore) / 2;
        }
      }
    });
    
    return totalComponents > 0 ? similarityScore / totalComponents : 0;
  }, []);

  // Obtener productos similares basados en componentes y precio
  const getSimilarProducts = React.useMemo(() => {
    if (!product || !products || products.length === 0) return [];
    
    const currentPrice = product.basePrice;
    const priceRange = currentPrice * 0.3; // ±30% del precio actual
    
    return products
      .filter(p => {
        // Filtrar productos de la misma categoría
        if (p.category !== product.category) return false;
        // Excluir el producto actual
        if (p.id === product.id || p._id === product._id) return false;
        // Filtrar por rango de precio
        if (Math.abs(p.basePrice - currentPrice) > priceRange) return false;
        // Debe tener componentes configurados
        return p.features && Object.keys(p.features).length > 0;
      })
      .map(p => ({
        ...p,
        id: p._id || p.id,
        similarity: calculateProductSimilarity(product, p)
      }))
      .filter(p => p.similarity > 3) // Solo productos con similitud significativa
      .sort((a, b) => b.similarity - a.similarity) // Ordenar por similitud
      .slice(0, 3); // Máximo 3 productos
  }, [product, products, calculateProductSimilarity]);

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return null;
  }

  // Filtrar productos relacionados y procesarlos
  const relatedProducts = products
    .filter(p => p.category === product.category && (p._id !== product._id && p.id !== product.id))
    .slice(0, 3)
    .map(relatedProduct => ({
      ...relatedProduct,
      id: relatedProduct._id || relatedProduct.id,
      images: Array.isArray(relatedProduct.images) 
        ? relatedProduct.images.filter(img => typeof img === 'string')
        : [],
      video: typeof relatedProduct.video === 'string' ? relatedProduct.video : 
             typeof relatedProduct.videoUrl === 'string' ? relatedProduct.videoUrl : '',
      specifications: relatedProduct.specifications || {}
    }));

  // Procesar las especificaciones para mostrarlas
  const specifications = Object.entries(product.specifications)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '');

  console.log('Specifications to render:', specifications);
  console.log('Configured components:', configuredComponents);

  // DEBUG: Verificar datos pasados a ImageCarousel
  console.log('Data for ImageCarousel:', { images: product.images, video: product.video });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ImageCarousel images={product.images} video={product.video} />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">{getLocalizedDescription()}</p>
          
          <div className="text-2xl font-bold text-gray-900">
            {safeTranslate('productDetail.price')}: ${product.basePrice}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="quantity" className="text-gray-700">
                {safeTranslate('productDetail.quantity')}:
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 px-3 py-2 border rounded-md"
              />
            </div>
            <span className={`text-sm font-medium ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? safeTranslate('productDetail.inStock') : safeTranslate('productDetail.outOfStock')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {safeTranslate('productDetail.addToCart')}
          </button>

          {/* Sección de componentes configurados mejorada */}
          {configuredComponents.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {safeTranslate('productDetail.configuredFeatures')}
              </h2>
              <div className="space-y-4">
                {configuredComponents.map(({ category, component, components }) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {safeTranslate(`products.categories.${category.replace('additional_', '')}`, { defaultValue: category })}
                    </h3>
                    {components ? (
                      <div className="grid grid-cols-1 gap-2">
                        {components.map((comp, index) => (
                          <div key={index} className="text-gray-600">
                            {comp.name}
                            {comp.description && (
                              <p className="text-sm text-gray-500">{comp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        {component.name}
                        {component.description && (
                          <p className="text-sm text-gray-500">{component.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {specifications.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {safeTranslate('productDetail.specifications')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-gray-600 capitalize">{safeTranslate(`products.${key}`, { defaultValue: key })}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de comparación inteligente */}
      {getSimilarProducts.length > 0 && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Similares
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Basado en componentes similares, rango de precio y características técnicas
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Producto actual */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl p-6 h-full">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mb-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Producto Actual</h3>
                  <p className="text-blue-100 text-sm">{product.name}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Precio:</span>
                    <span className="font-bold">${product.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Componentes:</span>
                    <span className="font-bold">{configuredComponents.length}</span>
                  </div>
                  <div className="pt-3 border-t border-blue-400">
                    <span className="text-xs text-blue-100">Tu selección actual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos similares */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getSimilarProducts.map((similarProduct, index) => {
                  const similarComponents = similarProduct.features ? Object.keys(similarProduct.features).length : 0;
                  const priceDiff = ((similarProduct.basePrice - product.basePrice) / product.basePrice * 100).toFixed(1);
                  const isMoreExpensive = similarProduct.basePrice > product.basePrice;
                  
                  return (
                    <div key={similarProduct.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <div className="text-center mb-4">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                          index === 1 ? 'bg-gray-100 text-gray-600' : 
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <span className="font-bold text-sm">#{index + 1}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                          {similarProduct.name}
                        </h4>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <span className="text-xs text-gray-500">Similitud:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < Math.round(similarProduct.similarity / 2) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Precio:</span>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">${similarProduct.basePrice.toLocaleString()}</span>
                            <div className={`text-xs ${isMoreExpensive ? 'text-red-500' : 'text-green-500'}`}>
                              {isMoreExpensive ? '+' : ''}{priceDiff}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Componentes:</span>
                          <span className="font-medium text-gray-700">{similarComponents}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-100">
                          <button 
                            onClick={() => navigate(`/producto/${similarProduct.id}`)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                          >
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">¿Por qué estos productos?</h3>
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                Nuestro algoritmo analiza los componentes configurados, sus rankings de calidad, 
                precios similares y características técnicas para sugerirte las mejores alternativas 
                que podrían interesarte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fallback a productos relacionados tradicionales si no hay similares */}
      {getSimilarProducts.length === 0 && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Sección de productos comparables tipo Mercado Libre */}
      {comparableProducts.length > 0 && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {safeTranslate('products.comparableProducts', { defaultValue: 'Productos comparables' })}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {safeTranslate('products.comparableProductsDescription', { defaultValue: 'Otros usuarios también vieron estos productos similares en la misma categoría.' })}
            </p>
          </div>
          <Swiper
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.2 }
            }}
            className="pb-8"
          >
            {comparableProducts.map(product => {
              // Ventajas/diferencias devueltas por el backend
              const mainAdvantages = (product.advantages || []).slice(0, 2); // Mostrar hasta 2 badges
              const tooltip = (product.advantages || []).join('\n');
              // Características clave
              const ram = product.features?.ram?.selectedComponent?.name || '';
              const storage = product.features?.storage?.selectedComponent?.name || '';
              const processor = product.features?.processor?.selectedComponent?.name || '';
              return (
                <SwiperSlide key={product.id}>
                  <div className="relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition-all duration-300 min-h-[340px] group" title={tooltip}>
                    {/* Badges de ventajas principales */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      {mainAdvantages.map((adv, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                          {adv}
                        </span>
                      ))}
                    </div>
                    {/* Imagen */}
                    <img src={product.images?.[0]} alt={product.name} className="w-32 h-32 object-contain mb-3 rounded" />
                    {/* Nombre */}
                    <div className="font-semibold text-gray-900 text-center mb-1 truncate w-full">{product.name}</div>
                    {/* Características clave */}
                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                      {processor && (
                        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"><CpuChipIcon className="h-4 w-4" />{processor}</span>
                      )}
                      {ram && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"><DevicePhoneMobileIcon className="h-4 w-4" />{ram}</span>
                      )}
                      {storage && (
                        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full"><InformationCircleIcon className="h-4 w-4" />{storage}</span>
                      )}
                    </div>
                    {/* Precio */}
                    <div className="text-lg font-bold text-green-700 mb-2">${product.basePrice?.toLocaleString()}</div>
                    {/* Botón */}
                    <button
                      onClick={() => navigate(`/producto/${product.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 mt-auto"
                    >
                      Comparar
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
