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
                 data.selectedComponent && 
                 typeof data.selectedComponent === 'object';
        })
        .map(([category, data]) => {
          const component = data.selectedComponent;
          return {
            category: String(category), // Asegurar que sea string
            component: {
              name: String(component.name || 'Sin nombre'),
              description: component.description ? String(component.description) : null,
              price: component.price ? Number(component.price) : null
            }
          };
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

          {/* Sección de componentes configurados */}
          {configuredComponents && configuredComponents.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Componentes Configurados
              </h2>
              <div className="space-y-4">
                {configuredComponents.map((item, index) => {
                  if (!item || !item.category || !item.component) {
                    return null;
                  }

                  const { category, component } = item;

                  return (
                    <div key={`component-${index}`} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 capitalize mb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-gray-600">Nombre:</span>
                          <span className="ml-2 text-gray-900">{component.name}</span>
                        </div>
                        {component.description && (
                          <div>
                            <span className="text-gray-600">Descripción:</span>
                            <span className="ml-2 text-gray-900">{component.description}</span>
                          </div>
                        )}
                        {component.price && (
                          <div>
                            <span className="text-gray-600">Precio:</span>
                            <span className="ml-2 text-gray-900">${component.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {safeTranslate('productDetail.relatedProducts')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
