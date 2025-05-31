import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VARIANT_TYPES, SPECIFICATIONS_STRUCTURE } from '../../types/product';
import { useStore } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const OptionCarousel = ({ options, selectedOption, onSelect, renderOption }) => {
  const [startIndex, setStartIndex] = useState(0);
  // Definir items por página según ancho de pantalla
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + itemsPerPage < options.length;

  const handleScrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(prev => Math.max(0, prev - itemsPerPage));
    }
  };

  const handleScrollRight = () => {
    if (canScrollRight) {
      setStartIndex(prev => Math.min(options.length - itemsPerPage, prev + itemsPerPage));
    }
  };

  return (
    <div className="relative">
      {/* Flecha izquierda oculta en móvil */}
      {canScrollLeft && (
        <button type="button"
          onClick={handleScrollLeft}
          className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-1 shadow-lg z-10"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
      )}

      <div className="overflow-x-auto px-4 snap-x snap-mandatory scrollbar-none">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-6 sm:gap-4"
          style={{ transform: `translateX(-${startIndex * (100 / itemsPerPage)}%)` }}
        >
          {options.map((option, index) => (
            <div
              key={`${option.id || option.name}-${index}`}
              className="flex-none snap-start px-2"
              style={{ minWidth: `${100 / itemsPerPage}%` }}
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      </div>

      {/* Flecha derecha oculta en móvil */}
      {canScrollRight && (
        <button type="button"
          onClick={handleScrollRight}
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-1 shadow-lg z-10"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
        </button>
      )}
    </div>
  );
};

const ConfigurableProductManager = ({ product, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const { specifications = SPECIFICATIONS_STRUCTURE } = useStore();
  
  const [searchTerms, setSearchTerms] = useState({});
  const [selectedComponents, setSelectedComponents] = useState(() => {
    const initialComponents = {};
    if (product?.features) {
      Object.entries(product.features).forEach(([category, feature]) => {
        if (feature?.selectedComponents) {
          // Multi-selección: ram (desktop/laptop) y storage
          initialComponents[category] = feature.selectedComponents.map(c => ({ ...c, category }));
        } else if (feature?.selectedComponent) {
          initialComponents[category] = { ...feature.selectedComponent, category };
        }
      });
    }
    console.log('Componentes iniciales:', initialComponents);
    return initialComponents;
  });

  // Determinar el tipo de especificación basado en la categoría del producto
  const specificationType = useMemo(() => {
    switch (product?.category?.toLowerCase()) { // usar toLowerCase para robustez
      case 'laptops':
        return 'laptop'; // Corregido para usar la nueva clave
      case 'smartphones':
        return 'mobile';
      case 'tablets':
        return 'tablet'; // Usar la nueva clave para tablets si existe en JSON
      case 'desktop': // Si tuvieras categoría Desktop
         return 'desktop';
      // Añadir más casos si es necesario
      default:
        return 'mobile'; // Fallback general
    }
  }, [product?.category]);

  // Determinar el tipo para Sistema Operativo
  const osType = useMemo(() => {
    switch (specificationType) {
      case 'laptop':
      case 'desktop':
        return 'computer';
      case 'mobile':
      case 'tablet':
        return 'mobile';
      default:
        return 'mobile';
    }
  }, [specificationType]);

  // Categorías de componentes disponibles
  const componentCategories = useMemo(() => {
    if (!specifications) return {};
    
    const categories = {};
    const specType = specificationType;
    
    // --- Categorías Principales (Comunes o Condicionales) ---
    const commonCategories = ['processors', 'ram', 'storage'];
    commonCategories.forEach(catKey => {
      if (specifications[catKey]?.[specType]) {
        categories[catKey] = {
          name: t(`products.categories.${catKey}`, { defaultValue: catKey }),
          type: specType,
          options: specifications[catKey][specType] || []
        };
      }
    });

    // Pantallas (Mobile, Tablet, Laptop)
    if (['mobile', 'tablet', 'laptop'].includes(specType) && specifications.screens?.[specType]) {
        categories.screens = { 
          name: t('products.categories.screens'), 
          type: specType,
          options: specifications.screens[specType] || []
      };
    }

    // Baterías (Mobile, Tablet, Laptop)
    if (['mobile', 'tablet', 'laptop'].includes(specType) && specifications.batteries?.[specType]) {
        categories.batteries = { 
          name: t('products.categories.batteries'), 
          type: specType,
          options: specifications.batteries[specType] || []
      };
    }

    // Sistema Operativo (Mobile/Tablet vs Laptop/Desktop)
    if (specifications.operatingSystems?.[osType]) {
       categories.operatingSystems = {
         name: t('products.categories.operatingSystems'),
         type: osType,
         options: specifications.operatingSystems[osType] || []
      };
    }

    // --- Categorías Específicas de Desktop ---
    if (specType === 'desktop') {
      const desktopSpecific = ['desktopCases', 'powerSupplies', 'gpu']; // Añadir GPU aquí o donde corresponda
      desktopSpecific.forEach(catKey => {
        if (specifications[catKey]?.desktop) {
           categories[catKey] = { 
             name: t(`products.categories.${catKey}`, { defaultValue: catKey }), // products.categories.desktopCases, etc.
             type: 'desktop',
             options: specifications[catKey].desktop || []
      };
        }
      });
    }

     // --- Categorías de Seguridad (Mobile, Laptop) ---
     if (['mobile', 'laptop'].includes(specType) && specifications.security?.[specType]) {
      categories.security = { 
        name: t('products.categories.security'), 
         type: specType,
         options: specifications.security[specType] || []
      };
    }

    // --- Características Adicionales (Filtradas por tipo) ---
    if (specifications.additionalFeatures) {
      Object.entries(specifications.additionalFeatures).forEach(([featureCategoryKey, featureOptions]) => {
        if (Array.isArray(featureOptions)) {
          const applicableOptions = featureOptions.filter(option => 
            !option.type || (Array.isArray(option.type) && option.type.includes(specType)) || option.type === specType
          );
          
          if (applicableOptions.length > 0) {
             // Usar una clave única para evitar colisiones, p.ej., 'additional_connectivity'
             const categoryKey = `additional_${featureCategoryKey}`;
             categories[categoryKey] = {
                name: t(`products.categories.${featureCategoryKey}`, { defaultValue: featureCategoryKey }), // products.categories.connectivity, etc.
                type: specType, // O podría ser 'additional'
            isAdditional: true,
                options: applicableOptions.map(option => ({ ...option, featureType: featureCategoryKey }))
          };
          }
        }
      });
    }

    console.log("Categorías generadas para tipo", specType, ":", categories);
    return categories;
  }, [specifications, t, specificationType, osType]); // Añadir osType como dependencia

  // Filtrar opciones basadas en términos de búsqueda
  const getFilteredOptions = (category, options = []) => {
    const searchTerm = searchTerms[category]?.toLowerCase() || '';
    if (!searchTerm) return options;

    return options.filter(option => {
      if (!option) return false;

      const searchableFields = [
        option.name,
        option.brand,
        option.description?.es,
        option.description?.en,
        ...(option.specs ? Object.values(option.specs) : []),
        ...(option.advantages || [])
      ].filter(Boolean);

      return searchableFields.some(field => 
        String(field).toLowerCase().includes(searchTerm)
      );
    });
  };

  const handleComponentSelect = (category, option) => {
    // Permitir multi-selección para ram (desktop/laptop), storage y características adicionales
    const isMulti = category === 'storage' || 
                   (category === 'ram' && ['laptop','desktop'].includes(specificationType)) ||
                   category.startsWith('additional_');
    
    const newComponents = { ...selectedComponents };
    if (isMulti) {
      // Asegurar que prev sea array
      const prev = Array.isArray(selectedComponents[category]) ? selectedComponents[category] : [];
      const exists = prev.some(c => c.id === option.id);
      
      // Limitar a 5 selecciones para características adicionales
      if (category.startsWith('additional_') && !exists && prev.length >= 5) {
        info(t('products.maxAdditionalFeaturesReached'));
        return;
      }
      
      newComponents[category] = exists ? prev.filter(c => c.id !== option.id) : [...prev, option];
    } else {
      newComponents[category] = option;
    }

    setSelectedComponents(newComponents);

    // Notificar al componente padre sobre el cambio en el siguiente ciclo
    if (onUpdate) {
      setTimeout(() => {
        // Convertir los componentes seleccionados al formato correcto para el servidor
        const formattedFeatures = {};
        Object.entries(newComponents).forEach(([cat, component]) => {
          if (!component) return;
          const multi = cat === 'storage' || 
                       (cat === 'ram' && ['laptop','desktop'].includes(specificationType)) ||
                       cat.startsWith('additional_');
          if (multi && Array.isArray(component)) {
            formattedFeatures[cat] = {
              selectedComponents: component.map(c => ({ ...c, category: cat }))
            };
          } else {
            formattedFeatures[cat] = {
              selectedComponent: { ...component, category: cat }
            };
          }
        });

        console.log('Características actualizadas:', formattedFeatures);
        onUpdate({
          features: formattedFeatures
        });
      }, 0);
    }
  };

  const renderOption = (option, category) => {
    const currentLanguage = i18n.language;
    // Detectar multi-selección para ram (desktop/laptop), storage y características adicionales
    const isMulti = category === 'storage' || 
                   (category === 'ram' && ['laptop','desktop'].includes(specificationType)) ||
                   category.startsWith('additional_');
    
    // Identificar si la opción está seleccionada
    const isSelected = isMulti
      ? Array.isArray(selectedComponents[category]) && selectedComponents[category].some(c => c.id === option.id)
      : selectedComponents[category]?.id === option.id;

    // Definir clases según tipo y estado
    const borderClass = isSelected
      ? (isMulti ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50')
      : (isMulti ? 'border-gray-200 hover:border-orange-300' : 'border-gray-200 hover:border-blue-300');

    const getTranslatedSpec = (key) => {
      return t(`products.specs.${key}`, { defaultValue: key });
    };

    return (
      <div
        onClick={() => handleComponentSelect(category, option)}
        className={`cursor-pointer h-full p-4 rounded-lg border ${borderClass}`}
      >
        <div className="space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium text-gray-900">
              {currentLanguage === 'en' ? option.name_en || option.name : option.name}
            </h4>
            {option.brand && (
              <span className="text-sm text-gray-500">{option.brand}</span>
            )}
          </div>
          
          {option.description && (
            <p className="text-sm text-gray-600">
              {currentLanguage === 'en' ? option.description.en : option.description.es}
            </p>
          )}

          {option.specs && Object.entries(option.specs).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(option.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500">{getTranslatedSpec(key)}:</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Estado para abrir/cerrar cada categoría en móvil
  const [openCategories, setOpenCategories] = useState({});
  const toggleCategory = (category) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Estado para abrir/cerrar cada opción en móvil
  const [openItems, setOpenItems] = useState({});
  const toggleItem = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Agrupar categorías adicionales y principales
  const mainCategories = Object.entries(componentCategories).filter(([_, { isAdditional }]) => !isAdditional);
  const additionalCategories = Object.entries(componentCategories).filter(([_, { isAdditional }]) => isAdditional);

  // Precio del producto formateado
  const formattedPrice = useMemo(() => {
    if (!product?.basePrice) return '$0,00';

    // Convertir el precio a un número
    const priceString = String(product.basePrice)
      .replace(/\./g, '') // Eliminar puntos de miles
      .replace(',', '.'); // Convertir coma decimal a punto decimal
    
    const price = parseFloat(priceString);
    if (isNaN(price)) return '$0,00';

    // Formatear el precio según el idioma
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }, [product?.basePrice, i18n.language]);

  return (
    <div className="space-y-8">
      {/* Categorías principales */}
      {mainCategories.map(([category, { name, options = [] }]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm p-6">
          <div
            className="flex justify-between items-center mb-4 cursor-pointer sm:cursor-auto"
            onClick={() => toggleCategory(category)}
          >
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            {/* Buscador solo desktop */}
            <div className="hidden sm:block w-64">
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerms[category] || ''}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, [category]: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Indicador toggle */}
            <span className="sm:hidden text-gray-600 ml-2">{openCategories[category] ? '-' : '+'}</span>
          </div>
          {/* Listado móvil: tarjetas colapsables por opción */}
          {openCategories[category] && (
            <div className="space-y-4 sm:hidden">
              {getFilteredOptions(category, options).map((option) => {
                const key = `${category}-${option.id || option.name}`;
                const isOpenItem = openItems[key];
                return (
                  <div key={key} className="border rounded-md overflow-hidden">
                    <div
                      className="p-4 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleItem(key)}
                    >
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                      <span className="text-gray-500">{option.brand}</span>
                      <span>{isOpenItem ? '-' : '+'}</span>
                    </div>
                    {isOpenItem && (
                      <div className="p-4 border-t bg-gray-50">
                        {renderOption(option, category)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Carrusel sólo desktop */}
          <div className="hidden sm:block">
            <OptionCarousel
              options={getFilteredOptions(category, options)}
              selectedOption={selectedComponents[category]}
              onSelect={(option) => handleComponentSelect(category, option)}
              renderOption={(option) => renderOption(option, category)}
            />
          </div>
        </div>
      ))}

      {/* Características adicionales */}
      {additionalCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {t('products.additionalFeatures')}
          </h3>

          <div className="space-y-8">
            {additionalCategories.map(([category, { name, options = [] }]) => (
              <div key={category} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">{name}</h4>
                  <div className="w-64">
                    <input
                      type="text"
                      placeholder={t('common.search')}
                      value={searchTerms[category] || ''}
                      onChange={(e) => setSearchTerms(prev => ({
                        ...prev,
                        [category]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <OptionCarousel
                  options={getFilteredOptions(category, options)}
                  selectedOption={selectedComponents[category]}
                  onSelect={(option) => handleComponentSelect(category, option)}
                  renderOption={(option) => renderOption(option, category)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Precio del producto */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">
            {t('products.price')}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

ConfigurableProductManager.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    features: PropTypes.object,
    basePrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ConfigurableProductManager; 