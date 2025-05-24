import { useState } from 'react';
import PropTypes from 'prop-types';
import { VARIANT_TYPES, FEATURE_TYPES, FEATURE_STRUCTURE } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import MediaManager from './MediaManager';

const VariantManager = ({ product, onUpdate }) => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  const [editingFeature, setEditingFeature] = useState(null);
  const [newOption, setNewOption] = useState({ label: '', value: '', priceIncrement: 0 });
  const [newModel, setNewModel] = useState({
    name: '',
    description: '',
    price: '',
    images: [],
    isIndependentProduct: false
  });

  const handleFeatureOptionAdd = (featureType) => {
    if (!newOption.label || !newOption.value) return;

    try {
      const updatedFeatures = {
        ...product.features,
        [featureType]: {
          ...product.features[featureType],
          options: [
            ...product.features[featureType].options,
            { ...newOption, priceIncrement: Number(newOption.priceIncrement) }
          ]
        }
      };

      onUpdate({ ...product, features: updatedFeatures });
      setNewOption({ label: '', value: '', priceIncrement: 0 });
      success(t('variantManager.optionAdded'));
    } catch (err) {
      error(t('variantManager.errorAddingOption'));
      console.error(err);
    }
  };

  const handleFeatureOptionRemove = (featureType, optionValue) => {
    try {
      const updatedFeatures = {
        ...product.features,
        [featureType]: {
          ...product.features[featureType],
          options: product.features[featureType].options.filter(
            opt => opt.value !== optionValue
          )
        }
      };

      onUpdate({ ...product, features: updatedFeatures });
      success(t('variantManager.optionRemoved'));
    } catch (err) {
      error(t('variantManager.errorRemovingOption'));
      console.error(err);
    }
  };

  const handleFeatureOptionEdit = (featureType, option, field, value) => {
    try {
      const updatedFeatures = {
        ...product.features,
        [featureType]: {
          ...product.features[featureType],
          options: product.features[featureType].options.map(opt =>
            opt.value === option.value
              ? { ...opt, [field]: field === 'priceIncrement' ? Number(value) : value }
              : opt
          )
        }
      };

      onUpdate({ ...product, features: updatedFeatures });
      success(t('variantManager.optionUpdated'));
    } catch (err) {
      error(t('variantManager.errorUpdatingOption'));
      console.error(err);
    }
  };

  const handleModelAdd = () => {
    if (!newModel.name || !newModel.price) return;

    const modelToAdd = {
      ...newModel,
      id: Date.now(),
      price: Number(newModel.price),
      images: newModel.images || product.images || [], // Usar las imágenes del producto si no hay específicas
    };

    const updatedModels = [...(product.models || []), modelToAdd];
    onUpdate({ ...product, models: updatedModels });
    setNewModel({
      name: '',
      description: '',
      price: '',
      images: [],
      isIndependentProduct: false
    });
  };

  const handleModelRemove = (modelId) => {
    const updatedModels = product.models.filter(model => model.id !== modelId);
    onUpdate({ ...product, models: updatedModels });
  };

  const handleModelEdit = (modelId, field, value) => {
    const updatedModels = product.models.map(model =>
      model.id === modelId
        ? { ...model, [field]: field === 'price' ? Number(value) : value }
        : model
    );

    onUpdate({ ...product, models: updatedModels });
  };

  const handleModelImagesChange = (modelId, images) => {
    const updatedModels = product.models.map(model =>
      model.id === modelId
        ? { ...model, images }
        : model
    );

    onUpdate({ ...product, models: updatedModels });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('variantManager.title')}</h3>
      
      {/* Sección de opciones de características */}
      {Object.entries(product.features || {}).map(([featureType, feature]) => (
        <div key={featureType} className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 capitalize">{featureType}</h4>
          
          {/* Lista de opciones existentes */}
          <div className="space-y-2">
            {feature.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-gray-500">({option.value})</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">
                      {t('variantManager.priceIncrement')}: ${option.priceIncrement}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingFeature(featureType)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {t('variantManager.editOption')}
                  </button>
                  <button
                    onClick={() => handleFeatureOptionRemove(featureType, option.value)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('variantManager.removeOption')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario para agregar nueva opción */}
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.optionLabel')}
              </label>
              <input
                type="text"
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.optionValue')}
              </label>
              <input
                type="text"
                value={newOption.value}
                onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.priceIncrement')}
              </label>
              <input
                type="number"
                value={newOption.priceIncrement}
                onChange={(e) => setNewOption({ ...newOption, priceIncrement: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => handleFeatureOptionAdd(featureType)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('variantManager.addOption')}
            </button>
          </div>
        </div>
      ))}

      {/* Sección de modelos */}
      <div className="mt-8 space-y-4">
        <h4 className="text-md font-medium text-gray-700">{t('variantManager.models')}</h4>
        
        {/* Lista de modelos existentes */}
        <div className="space-y-4">
          {(product.models || []).map((model) => (
            <div key={model.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-medium">{model.name}</h5>
                  <p className="text-gray-600">{model.description}</p>
                  <p className="text-gray-900 font-medium mt-2">${model.price}</p>
                </div>
                <button
                  onClick={() => handleModelRemove(model.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  {t('variantManager.removeModel')}
                </button>
              </div>
              
              {/* MediaManager para cada modelo */}
              <div className="mt-4">
                <MediaManager
                  images={model.images || []}
                  onImagesChange={(images) => handleModelImagesChange(model.id, images)}
                  onVideoChange={() => {}} // Los modelos no tienen videos por ahora
                />
              </div>
            </div>
          ))}
        </div>

        {/* Formulario para agregar nuevo modelo */}
        <div className="border-t pt-4">
          <h5 className="text-md font-medium text-gray-700 mb-4">{t('variantManager.addModel')}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.modelName')}
              </label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.modelPrice')}
              </label>
              <input
                type="number"
                value={newModel.price}
                onChange={(e) => setNewModel({ ...newModel, price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('variantManager.modelDescription')}
              </label>
              <textarea
                value={newModel.description}
                onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <MediaManager
                images={newModel.images}
                onImagesChange={(images) => setNewModel({ ...newModel, images })}
                onVideoChange={() => {}} // Los modelos no tienen videos por ahora
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleModelAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('variantManager.addModel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

VariantManager.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    features: PropTypes.object,
    models: PropTypes.array,
    images: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default VariantManager; 