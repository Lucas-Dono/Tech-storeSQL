import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VARIANT_TYPES } from '../../types/product';
import { useStore } from '../../context/StoreContext';
import MediaManager from './MediaManager';
import { useTranslation } from 'react-i18next';

const ConfigurableProductManager = ({ product, onUpdate }) => {
  const { t } = useTranslation();
  const { specifications, products } = useStore();
  
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(componentCategories)
            .filter(([category]) => category !== 'additionalFeatures')
            .map(([category, categoryInfo]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                {categoryInfo.name}
                </h4>
                
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                  placeholder={t('configurableProduct.searchPlaceholder', { component: categoryInfo.name.toLowerCase() })}
                  value={searchTerms[category] || ''}
                      onChange={(e) => {
                    setSearchTerms(prev => ({
                      ...prev,
                      [category]: e.target.value
                    }));
                        setActiveCategory(category);
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="relative">
                <div className="flex flex-col space-y-2">
                  {filteredOptionsByCategory[category]?.map((option) => (
                    <div
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        selectedComponents[category]?.id === option.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'border hover:border-blue-300'
                      } rounded-lg p-4`}
                      onClick={() => handleFeatureSelect(category, option)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{option.name || t('configurableProduct.noName')}</h5>
                          {option.brand && (
                            <p className="text-sm text-gray-600">{option.brand}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {t('configurableProduct.priceIncrement', { price: (option.priceIncrement || 0).toFixed(2) })}
                        </span>
                      </div>
                      {option.specs && (
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          {Object.entries(option.specs).map(([key, value]) => (
                            <div key={key}>
                              <span className="capitalize">{key.replace('_', ' ')}: </span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Características Adicionales - Siempre visible */}
        {specifications?.additionalFeatures?.mobile && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Características Adicionales</h3>
              <input
                type="text"
                placeholder="Buscar características adicionales..."
                value={searchTerms.additionalFeatures || ''}
                onChange={(e) => {
                  setSearchTerms(prev => ({
                    ...prev,
                    additionalFeatures: e.target.value
                  }));
                }}
                className="w-1/3 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {['biometrics', 'sound', 'connectivity', 'protection', 'security', 'gaming']
              .filter(featureType => 
                Array.isArray(specifications.additionalFeatures.mobile[featureType])
              )
              .map((featureType) => {
                const searchTerm = searchTerms.additionalFeatures?.toLowerCase() || '';
                const filteredOptions = specifications.additionalFeatures.mobile[featureType]
                  .filter(option => {
                    if (!searchTerm) return true;
                    
                    const searchableFields = [
                      option.name,
                      option.brand,
                      ...(option.specs ? Object.values(option.specs) : []),
                      ...(option.description ? Object.values(option.description) : []),
                      ...(option.advantages || [])
                    ].filter(Boolean);

                    return searchableFields.some(field => 
                      String(field).toLowerCase().includes(searchTerm)
                    );
                  });

                if (filteredOptions.length === 0) return null;

                return (
                  <div key={featureType} className="border-b pb-4">
                    <h4 className="text-lg font-semibold mb-3 capitalize">{featureType}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedComponents[featureType]?.id === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-blue-300'
                          }`}
                          onClick={() => handleFeatureSelect(featureType, option)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{option.name || 'Sin nombre'}</h5>
                            <span className="text-sm text-gray-500">
                              +${(option.priceIncrement || 0).toFixed(2)}
                            </span>
                          </div>
                          {option.specs && (
                            <div className="text-sm text-gray-600 space-y-2">
                              {Object.entries(option.specs).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium capitalize">
                                    {key.replace('_', ' ')}: 
                                  </span>
                                  {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Sección de Modelos/Variantes */}
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{t('configurableProduct.productVariants')}</h3>
            <div className="text-lg font-medium text-gray-900">
              {t('configurableProduct.basePrice', { price: product.basePrice.toFixed(2) })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder={t('configurableProduct.searchProductsPlaceholder')}
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
                  </div>

            {/* Lista de productos disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`cursor-pointer transition-all ${
                      selectedModels.some(m => m.id === prod.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'border hover:border-blue-300'
                    } rounded-lg p-4`}
                    onClick={() => handleProductSelect(prod)}
                  >
                    <div className="flex space-x-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        {prod.images?.length > 0 ? (
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">{t('configurableProduct.noImage')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{prod.name}</h5>
                            <p className="text-sm text-gray-600">{prod.description}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            ${prod.basePrice.toFixed(2)}
                          </span>
                        </div>
                        {prod.features && (
                          <div className="mt-2 text-sm text-gray-500">
                            {Object.entries(prod.features).map(([category, data]) => (
                              data.selectedComponent && (
                                <div key={category} className="text-xs">
                                  <span className="font-medium capitalize">{category}: </span>
                                  <span>{data.selectedComponent.name}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-gray-500">
                  {productSearchTerm 
                    ? t('configurableProduct.noProductsFound')
                    : t('configurableProduct.noProductsInCategory')}
                </div>
              )}
                  </div>

            {/* Variantes seleccionadas */}
            {selectedModels.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {t('configurableProduct.selectedVariants')}
                </h4>
                <div className="space-y-4">
                  {selectedModels.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          {model.images?.length > 0 ? (
                            <img 
                              src={model.images[0]} 
                              alt={model.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400">{t('configurableProduct.noImage')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-gray-900">{model.name}</h5>
                              <p className="text-sm text-gray-600">{model.description}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              ${model.price.toFixed(2)}
                            </span>
                          </div>
                          {model.features && (
                            <div className="mt-2 text-sm text-gray-500">
                              {Object.entries(model.features).map(([category, data]) => (
                                data.selectedComponent && (
                                  <div key={category} className="text-xs">
                                    <span className="font-medium capitalize">{category}: </span>
                                    <span>{data.selectedComponent.name}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleModelRemove(model.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    features: PropTypes.object,
    models: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ConfigurableProductManager; 