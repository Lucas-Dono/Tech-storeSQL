import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VARIANT_TYPES, SPECIFICATIONS_STRUCTURE } from '../../types/product';
import { useStore } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const OptionCarousel = ({ options, selectedOption, onSelect, renderOption }) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3;

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
      {canScrollLeft && (
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-1 shadow-lg z-10"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
      )}

      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${startIndex * (100 / itemsPerPage)}%)` }}
        >
          {options.map((option, index) => (
            <div 
              key={`${option.id || option.name}-${index}`}
              className="flex-none w-[calc(33.333%-1rem)]"
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      </div>

      {canScrollRight && (
        <button
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-1 shadow-lg z-10"
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
        if (feature?.selectedComponent) {
          initialComponents[category] = {
            ...feature.selectedComponent,
            category
          };
        }
      });
    }
    console.log('Componentes iniciales:', initialComponents);
    return initialComponents;
  });

  // Categorías de componentes disponibles
  const componentCategories = useMemo(() => {
    if (!specifications) return {};
    
    const categories = {};
    
    // Procesador
    if (specifications.processors?.mobile) {
      categories.processor = { 
        name: t('products.categories.processor'), 
        type: 'mobile',
        options: specifications.processors.mobile || []
      };
    }

    // RAM
    if (specifications.ram?.mobile) {
      categories.ram = { 
        name: t('products.categories.ram'), 
        type: 'mobile',
        options: specifications.ram.mobile || []
      };
    }

    // Almacenamiento
    if (specifications.storage?.mobile) {
      categories.storage = { 
        name: t('products.categories.storage'), 
        type: 'mobile',
        options: specifications.storage.mobile || []
      };
    }

    // Pantalla
    if (specifications.screen?.mobile) {
      categories.screen = { 
        name: t('products.categories.screen'), 
        type: 'mobile',
        options: specifications.screen.mobile || []
      };
    }

    // Batería
    if (specifications.battery?.mobile) {
      categories.battery = { 
        name: t('products.categories.battery'), 
        type: 'mobile',
        options: specifications.battery.mobile || []
      };
    }

    // Seguridad
    if (specifications.security?.mobile) {
      categories.security = { 
        name: t('products.categories.security'), 
        type: 'mobile',
        options: specifications.security.mobile || []
      };
    }

    // Gaming
    if (specifications.gaming?.mobile) {
      categories.gaming = { 
        name: t('products.categories.gaming'), 
        type: 'mobile',
        options: specifications.gaming.mobile || []
      };
    }

    // Características adicionales organizadas por tipo
    if (specifications.additionalFeatures?.mobile) {
      const featureTypes = {
        biometrics: 'products.categories.biometrics',
        sound: 'products.categories.sound',
        connectivity: 'products.categories.connectivity',
        protection: 'products.categories.protection',
        security: 'products.categories.security',
        gaming: 'products.categories.gaming'
      };

      Object.entries(featureTypes).forEach(([type, translationKey]) => {
        if (Array.isArray(specifications.additionalFeatures.mobile[type])) {
          categories[`additional_${type}`] = {
            name: t(translationKey),
            type: 'mobile',
            isAdditional: true,
            options: specifications.additionalFeatures.mobile[type].map(option => ({
              ...option,
              featureType: type
            }))
          };
        }
      });
    }

    return categories;
  }, [specifications, t]);

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
    const newComponents = {
      ...selectedComponents,
      [category]: option
    };

    setSelectedComponents(newComponents);

    // Notificar al componente padre sobre el cambio en el siguiente ciclo
    if (onUpdate) {
      setTimeout(() => {
        // Convertir los componentes seleccionados al formato correcto para el servidor
        const formattedFeatures = {};
        Object.entries(newComponents).forEach(([category, component]) => {
          if (component) {
            // Asegurarse de que cada componente tenga toda la información necesaria
            formattedFeatures[category] = {
              selectedComponent: {
                ...component,
                category: category // Incluir la categoría en el componente
              }
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

    const getTranslatedSpec = (key) => {
      return t(`products.specs.${key}`);
    };

    return (
      <div
        onClick={() => handleComponentSelect(category, option)}
        className={`cursor-pointer h-full p-4 rounded-lg border ${
          selectedComponents[category]?.name === option.name
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
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
    id: PropTypes.string,
    _id: PropTypes.string,
    features: PropTypes.object,
    basePrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ConfigurableProductManager; 