import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VARIANT_TYPES } from '../../types/product';
import { useStore } from '../../context/StoreContext';
import MediaManager from './MediaManager';
import { useTranslation } from 'react-i18next';

const ConfigurableProductManager = ({ product, onUpdate }) => {
  const { t } = useTranslation();
  const { specifications, products } = useStore();
  
  // Validar que el producto tenga un ID válido
  const productId = product.id || product._id;
  if (!productId) {
    console.error('Producto sin ID válido:', product);
    return null;
  }
  
  // Estados para la gestión de componentes
  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const features = {};
    if (product.features) {
      Object.entries(product.features).forEach(([feature, data]) => {
        features[feature] = !!data.selectedComponent;
      });
    }
    return features;
  });

  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [filteredOptionsByCategory, setFilteredOptionsByCategory] = useState({});
  const [selectedComponents, setSelectedComponents] = useState(() => {
    const components = {};
    if (product.features) {
      Object.entries(product.features).forEach(([feature, data]) => {
        if (data.selectedComponent) {
          components[feature] = data.selectedComponent;
        }
      });
    }
    return components;
  });

  // Estados para la gestión de modelos
  const [newModel, setNewModel] = useState({
    name: '',
    description: '',
    price: '',
    specs: {}
  });

  // Estado para el precio total
  const [totalPrice, setTotalPrice] = useState(() => {
    let initial = Number(product.basePrice);
    if (product.features) {
      Object.values(product.features).forEach(feature => {
        if (feature.selectedComponent?.priceIncrement) {
          initial += Number(feature.selectedComponent.priceIncrement);
        }
      });
    }
    return initial;
  });

  // Estados para la búsqueda y selección de modelos
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState(product.models || []);

  // Estado para búsqueda de productos
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Estados para la gestión de medios
  const [productImages, setProductImages] = useState(product.images || []);
  const [productVideo, setProductVideo] = useState(product.video || null);

  console.log('Products loaded:', products);
  console.log('Current product:', product);

  // Categorías de componentes disponibles según el tipo de producto
  const componentCategories = useMemo(() => {
    if (!specifications) return {};
    
    const categories = {};
    
    // Solo añadir categorías que existen en specifications
    if (specifications.processors?.mobile) {
      categories.processor = { name: t('products.processor'), type: 'mobile' };
    }
    if (specifications.ram?.mobile) {
      categories.ram = { name: t('products.ram'), type: 'mobile' };
    }
    if (specifications.storage?.mobile) {
      categories.storage = { name: t('products.storage'), type: 'mobile' };
    }
    if (specifications.screen?.mobile) {
      categories.screen = { name: t('products.screen'), type: 'mobile' };
    }
    if (specifications.battery?.mobile) {
      categories.battery = { name: t('products.battery'), type: 'mobile' };
    }
    if (specifications.camera?.mobile) {
      categories.camera = { name: t('products.camera'), type: 'mobile' };
    }
    if (specifications.additionalFeatures?.mobile) {
      categories.additionalFeatures = { name: t('configurableProduct.additionalFeatures'), type: 'mobile' };
    }

    console.log('Component categories initialized:', categories);
    return categories;
  }, [specifications, t]);

  // Cargar las opciones cuando cambia la categoría activa o el término de búsqueda
  useEffect(() => {
    console.log('Search effect triggered with:', {
      activeCategory,
      searchTerms,
      hasSpecifications: !!specifications
    });

    if (activeCategory && specifications) {
      const categoryKey = activeCategory === 'processor' ? 'processors' : activeCategory;
      const type = componentCategories[activeCategory]?.type;
      const currentSearchTerm = searchTerms[activeCategory] || '';
      
      console.log('Searching in category:', categoryKey);
      console.log('Product type:', type);
      
      // Manejo especial para características adicionales
      if (activeCategory === 'additionalFeatures') {
        if (specifications.additionalFeatures?.[type]) {
          const allFeatures = ['biometrics', 'sound', 'connectivity', 'protection', 'security', 'gaming']
            .filter(featureType => 
              Array.isArray(specifications.additionalFeatures[type][featureType])
            )
            .flatMap(featureType => 
              specifications.additionalFeatures[type][featureType].map(option => ({
                ...option,
                featureType
              }))
            );

          const searchTermLower = currentSearchTerm.toLowerCase();
          
          const filtered = allFeatures.filter(option => {
            if (!searchTermLower) return true;

            if (option.name?.toLowerCase().includes(searchTermLower)) return true;
            if (option.brand?.toLowerCase().includes(searchTermLower)) return true;
            
            if (option.description) {
              const descriptionValues = Object.values(option.description);
              if (descriptionValues.some(desc => 
                desc.toLowerCase().includes(searchTermLower)
              )) return true;
            }
            
            if (Array.isArray(option.advantages) && 
                option.advantages.some(adv => 
                  adv.toLowerCase().includes(searchTermLower)
                )) return true;

            if (option.specs) {
              const specValues = Object.values(option.specs);
              if (specValues.some(spec => 
                String(spec).toLowerCase().includes(searchTermLower)
              )) return true;
            }

            return false;
          });

          setFilteredOptionsByCategory(prev => ({
            ...prev,
            [activeCategory]: filtered
          }));
        }
      } else {
        // Manejo normal para otras categorías
        if (specifications[categoryKey]?.[type]) {
          const options = specifications[categoryKey][type];
          const searchTermLower = currentSearchTerm.toLowerCase();
          
          const filtered = options.filter(option => {
            if (!searchTermLower) return true;

            if (option.name?.toLowerCase().includes(searchTermLower)) return true;
            if (option.brand?.toLowerCase().includes(searchTermLower)) return true;
            
            if (option.description) {
              const descriptionValues = Object.values(option.description);
              if (descriptionValues.some(desc => 
                desc.toLowerCase().includes(searchTermLower)
              )) return true;
            }
            
            if (Array.isArray(option.advantages) && 
                option.advantages.some(adv => 
                  adv.toLowerCase().includes(searchTermLower)
                )) return true;

            if (option.specs) {
              const specValues = Object.values(option.specs);
              if (specValues.some(spec => 
                String(spec).toLowerCase().includes(searchTermLower)
              )) return true;
            }

            return false;
          });

          setFilteredOptionsByCategory(prev => ({
            ...prev,
            [activeCategory]: filtered
          }));
        } else {
          setFilteredOptionsByCategory(prev => ({
            ...prev,
            [activeCategory]: []
          }));
        }
      }
    }
  }, [activeCategory, searchTerms, specifications, componentCategories]);

  // Actualizar el precio total cuando cambian los componentes seleccionados
  useEffect(() => {
    const basePrice = Number(product.basePrice);
    let newTotal = basePrice;
    Object.values(selectedComponents).forEach(component => {
      if (component) {
        newTotal += Number(component.priceIncrement) || 0;
      }
    });
    setTotalPrice(newTotal);
  }, [selectedComponents, product.basePrice]);

  // Efecto para filtrar modelos basado en el término de búsqueda
  useEffect(() => {
    console.log('Todos los productos:', products);
    
    // Filtrar productos con modelos
    const productsWithModels = products.filter(p => p.id !== product.id && p.models && p.models.length > 0);
    console.log('Productos con modelos:', productsWithModels);

    // Obtener todos los modelos de los productos existentes, excluyendo el producto actual
    const allModels = productsWithModels.flatMap(p => {
      console.log(`Modelos del producto ${p.name}:`, p.models);
      return p.models.map(model => ({
        ...model,
        fromProduct: p.name
      }));
    });

    console.log('Modelos disponibles:', allModels);

    const searchTermLower = modelSearchTerm.toLowerCase();
    const filtered = allModels.filter(model => {
      if (!searchTermLower) return true;

      const searchableFields = [
        model.name,
        model.description,
        model.fromProduct,
        ...Object.values(model.specs || {})
      ].filter(Boolean);

      return searchableFields.some(field => 
        String(field).toLowerCase().includes(searchTermLower)
      );
    });

    console.log('Modelos filtrados:', filtered);
    setFilteredModels(filtered);
  }, [modelSearchTerm, products, product.id]);

  // Efecto para filtrar productos basado en el término de búsqueda
  useEffect(() => {
    const searchTermLower = productSearchTerm.toLowerCase();
    
    // Filtrar productos de la misma categoría, excluyendo el producto actual
    const filtered = products.filter(p => {
      if (p.id === product.id) return false;
      if (p.category !== product.category) return false;
      
      if (!searchTermLower) return true;

      const searchableFields = [
        p.name,
        p.description,
        ...(p.features ? Object.values(p.features).map(f => f.name) : [])
      ].filter(Boolean);

      return searchableFields.some(field => 
        String(field).toLowerCase().includes(searchTermLower)
      );
    });

    setFilteredProducts(filtered);
  }, [productSearchTerm, products, product.id, product.category]);

  const handleFeatureToggle = (feature) => {
    console.log('Feature toggle:', feature);
    setSelectedFeatures(prev => {
      const newFeatures = {
        ...prev,
        [feature]: !prev[feature]
      };
      console.log('New selected features:', newFeatures);
      return newFeatures;
    });

    // Si se está desactivando una característica, limpiar el componente seleccionado
    if (selectedFeatures[feature]) {
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        delete newComponents[feature];
        console.log('Updated components after feature toggle:', newComponents);
        return newComponents;
      });
    }
  };

  const handleFeatureSelect = (category, feature) => {
    // Activar automáticamente la característica cuando se selecciona un componente
    setSelectedFeatures(prev => ({
      ...prev,
      [category]: true
    }));

    setSelectedComponents(prev => ({
      ...prev,
      [category]: feature
    }));

    // Si se deselecciona el componente (feature es null), desactivar la característica
    if (!feature) {
      setSelectedFeatures(prev => ({
        ...prev,
        [category]: false
      }));
    }

    // Actualizar el precio total
    let newTotal = Number(product.basePrice);
    Object.entries(selectedComponents).forEach(([cat, comp]) => {
      if (cat !== category && comp?.priceIncrement) {
        newTotal += Number(comp.priceIncrement);
      }
    });
    if (feature?.priceIncrement) {
      newTotal += Number(feature.priceIncrement);
    }
    setTotalPrice(newTotal);
  };

  const handleModelAdd = () => {
    if (!newModel.name || !newModel.price) return;

    // Crear un nuevo modelo basado en las especificaciones actuales
    const modelToAdd = {
      ...newModel,
      id: Date.now().toString(),
      price: Number(product.basePrice) + Number(newModel.price),
      specs: Object.entries(selectedComponents).reduce((acc, [category, component]) => ({
        ...acc,
        [category]: component ? {
          name: component.name,
          brand: component.brand,
          specs: component.specs
        } : null
      }), {})
    };

    console.log('Agregando nuevo modelo:', modelToAdd);

    const updatedProduct = {
      ...product,
      models: [...(product.models || []), modelToAdd]
    };

    console.log('Producto actualizado con nuevo modelo:', updatedProduct);
    onUpdate(updatedProduct);
    setNewModel({
      name: '',
      description: '',
      price: '',
      specs: {}
    });
  };

  const handleModelSelect = (model) => {
    setSelectedModels(prev => {
      const exists = prev.some(m => m.id === model.id);
      if (exists) {
        return prev.filter(m => m.id !== model.id);
      } else {
        return [...prev, {
          ...model,
          price: Number(model.price || 0),
          specs: {
            ...model.specs,
            ...Object.entries(selectedComponents).reduce((acc, [category, component]) => ({
              ...acc,
              [category]: component.name
            }), {})
          }
        }];
      }
    });
  };

  const handleModelRemove = (modelId) => {
    setSelectedModels(prev => prev.filter(model => model.id !== modelId));
  };

  const handleProductSelect = (selectedProduct) => {
    const modelToAdd = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description,
      price: selectedProduct.basePrice,
      images: selectedProduct.images || [],
      specs: selectedProduct.features ? 
        Object.entries(selectedProduct.features).reduce((acc, [category, data]) => ({
          ...acc,
          [category]: data.selectedComponent
        }), {}) : {}
    };

    setSelectedModels(prev => {
      const exists = prev.some(m => m.id === modelToAdd.id);
      if (exists) {
        return prev.filter(m => m.id !== modelToAdd.id);
      }
      return [...prev, modelToAdd];
    });
  };

  const handleSave = () => {
    // Preparar las características configurables
    const features = Object.keys(selectedFeatures).reduce((acc, feature) => {
      // Solo incluir características que tienen un componente seleccionado
      if (selectedComponents[feature]) {
        acc[feature] = {
          name: selectedComponents[feature]?.name || '',
          selectedComponent: selectedComponents[feature],
          options: specifications?.[feature === 'processor' ? 'processors' : feature]?.mobile || []
        };
      }
      return acc;
    }, {});

    // Preparar el producto actualizado
    const updatedProduct = {
      ...product,
      features,
      models: selectedModels,
      images: productImages,
      video: productVideo,
      variantType: VARIANT_TYPES.CONFIGURABLE
    };

    // Llamar a la función de actualización
    onUpdate(updatedProduct);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('configurableProduct.title')}</h3>
        
        {/* Sección de medios */}
        <MediaManager
          images={productImages}
          video={productVideo}
          onImagesChange={setProductImages}
          onVideoChange={setProductVideo}
        />

        {/* Características configurables */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('configurableProduct.features')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(componentCategories).map(([category, { name }]) => (
              <div key={`category-${category}`} className="relative">
                <button
                  onClick={() => handleFeatureToggle(category)}
                  className={`w-full p-4 text-left rounded-lg border ${
                    selectedFeatures[category]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{name}</span>
                    <span className={`text-sm ${selectedFeatures[category] ? 'text-blue-600' : 'text-gray-500'}`}>
                      {selectedFeatures[category] ? t('configurableProduct.selected') : t('configurableProduct.notSelected')}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones de características */}
        {Object.entries(selectedFeatures).map(([category, isSelected]) => (
          isSelected && (
            <div key={`options-${category}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">{componentCategories[category]?.name}</h4>
                <input
                  type="text"
                  placeholder={t('configurableProduct.search')}
                  value={searchTerms[category] || ''}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, [category]: e.target.value }))}
                  className="w-64 px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOptionsByCategory[category]?.map((option) => (
                  <div key={`option-${category}-${option.id || option.name}`} className="relative">
                    <button
                      onClick={() => handleFeatureSelect(category, option)}
                      className={`w-full p-4 text-left rounded-lg border ${
                        selectedComponents[category]?.id === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.name}</span>
                          {option.priceIncrement > 0 && (
                            <span className="text-sm text-green-600">
                              +{option.priceIncrement}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-sm text-gray-600">{option.description}</p>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Modelos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('configurableProduct.models')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedModels.map((model) => (
              <div key={`model-${model.id || model.name}`} className="relative">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{model.name}</span>
                    <button
                      onClick={() => handleModelRemove(model.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="sr-only">{t('common.remove')}</span>
                      ×
                    </button>
                  </div>
                  {model.description && (
                    <p className="text-sm text-gray-600">{model.description}</p>
                  )}
                  {model.price && (
                    <p className="text-sm text-green-600 mt-2">+{model.price}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('configurableProduct.saveConfiguration')}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfigurableProductManager.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    features: PropTypes.object,
    models: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ConfigurableProductManager; 