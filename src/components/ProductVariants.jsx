import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { VARIANT_TYPES, FEATURE_STRUCTURE, calculateConfigurablePrice } from '../types/product';
import Select from './common/Select';
import { useAlert } from '../context/AlertContext';
import { useTranslation } from 'react-i18next';

const ProductVariants = ({ product, onVariantChange }) => {
  const { t } = useTranslation();
  const { info } = useAlert();
  const [selectedFeatures, setSelectedFeatures] = useState(product.defaultConfiguration || {});
  const [selectedModel, setSelectedModel] = useState(product.models?.[0] || null);
  const [currentPrice, setCurrentPrice] = useState(product.basePrice);

  useEffect(() => {
    if (product.variantType === VARIANT_TYPES.CONFIGURABLE) {
      const newPrice = calculateConfigurablePrice(
        product.basePrice,
        selectedFeatures,
        product.features
      );
      setCurrentPrice(newPrice);
      onVariantChange({
        type: VARIANT_TYPES.CONFIGURABLE,
        features: selectedFeatures,
        price: newPrice
      });
      
      if (newPrice !== product.basePrice) {
        info(t('products.priceUpdated', { price: newPrice }));
      }
    } else if (product.variantType === VARIANT_TYPES.MODEL && selectedModel) {
      setCurrentPrice(selectedModel.price);
      onVariantChange({
        type: VARIANT_TYPES.MODEL,
        model: selectedModel,
        price: selectedModel.price
      });
      
      info(t('products.modelSelected', { name: selectedModel.name }));
    }
  }, [selectedFeatures, selectedModel, product, t, info]);

  if (product.variantType === VARIANT_TYPES.CONFIGURABLE) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('products.configureProduct')}</h3>
        {Object.entries(product.features).map(([featureType, feature]) => (
          <div key={featureType} className="space-y-2">
            <Select
              label={feature.name}
              options={feature.options.map(option => ({
                value: option.value,
                label: `${option.label} ${option.priceIncrement > 0 ? `(+$${option.priceIncrement})` : t('products.included')}`
              }))}
              value={selectedFeatures[featureType] || ''}
              onChange={(value) => setSelectedFeatures(prev => ({
                ...prev,
                [featureType]: value
              }))}
            />
          </div>
        ))}
        <div className="mt-4 text-lg font-semibold text-gray-900">
          {t('products.totalPrice')}: ${currentPrice}
        </div>
      </div>
    );
  }

  if (product.variantType === VARIANT_TYPES.MODEL) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('products.selectModel')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {product.models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedModel?.id === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="font-medium text-gray-900">{model.name}</div>
              <div className="text-sm text-gray-500">{model.description}</div>
              <div className="mt-2 font-semibold text-gray-900">${model.price}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

ProductVariants.propTypes = {
  product: PropTypes.shape({
    variantType: PropTypes.oneOf(Object.values(VARIANT_TYPES)).isRequired,
    basePrice: PropTypes.number.isRequired,
    features: PropTypes.object,
    models: PropTypes.array,
    defaultConfiguration: PropTypes.object
  }).isRequired,
  onVariantChange: PropTypes.func.isRequired
};

export default ProductVariants; 