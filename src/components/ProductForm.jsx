import { useState } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PRODUCT, CURRENCIES, DEFAULT_CURRENCY, VARIANT_TYPES } from '../types/product';
import Select from './common/Select';
import { useTranslation } from 'react-i18next';
import MediaManager from './admin/MediaManager';
import ConfigurableProductManager from './admin/ConfigurableProductManager';

const ProductForm = ({ onSubmit, initialData = DEFAULT_PRODUCT }) => {
  const { t } = useTranslation();

  const formatNumber = (value) => {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const [integerPart, decimalPart] = cleanValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
  };

  const [formData, setFormData] = useState({
    ...DEFAULT_PRODUCT,
    ...initialData,
    basePrice: initialData?.basePrice ? formatNumber(initialData.basePrice.toString()) : '',
    currency: initialData?.currency || DEFAULT_CURRENCY,
    stock: initialData?.stock || '',
    images: initialData?.images || [],
    video: initialData?.video || null,
    variantType: initialData?.variantType || VARIANT_TYPES.CONFIGURABLE,
    features: initialData?.features || {},
    models: initialData?.models || []
  });

  const handlePriceChange = (e) => {
    const { value } = e.target;
    if (!/^[\d.,]*$/.test(value)) return;
    try {
      const formattedValue = formatNumber(value);
      setFormData(prev => ({ ...prev, basePrice: formattedValue }));
    } catch (error) {
      console.error('Error al formatear número:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stock') {
      if (!/^\d*$/.test(value)) return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice.replace(/\./g, '').replace(',', '.')),
      stock: parseInt(formData.stock, 10) || 0
    };

    // Eliminar el campo id si estamos creando un nuevo producto
    if (!initialData?.id) {
      delete processedData.id;
    }

    await onSubmit(processedData);
  };

  const handleConfigurableUpdate = (updatedConfig) => {
    setFormData(prev => ({
      ...prev,
      features: updatedConfig.features,
      models: updatedConfig.models
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección de información básica */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('productForm.basicInfo')}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Nombre del producto */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('Nombre del producto')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <Select
              label={t('productForm.category')}
              options={[
                { value: '', label: t('productForm.selectCategory') },
                { value: 'Laptops', label: 'Laptops' },
                { value: 'Smartphones', label: 'Smartphones' },
                { value: 'Tablets', label: 'Tablets' },
                { value: 'Accesorios', label: t('productForm.accessories') }
              ]}
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('productForm.price')}
            </label>
            <div className="mt-1 flex">
              <Select
                options={Object.entries(CURRENCIES).map(([code, currency]) => ({
                  value: code,
                  label: `${currency.name} (${currency.symbol})`,
                  icon: <span>{currency.symbol}</span>
                }))}
                value={formData.currency}
                onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                className="w-32"
              />
              <input
                type="text"
                name="basePrice"
                value={formData.basePrice}
                onChange={handlePriceChange}
                placeholder="0,00"
                className="block w-full rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('productForm.stock')}
            </label>
            <input
              type="text"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Descripción en español */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            {t('productForm.descriptionEs')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Descripción en inglés */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            {t('productForm.descriptionEn')}
          </label>
          <textarea
            name="description_en"
            value={formData.description_en || ''}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sección de multimedia */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('productForm.multimedia')}</h2>
        <MediaManager
          images={formData.images}
          video={formData.video}
          onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
          onVideoChange={(video) => setFormData(prev => ({ ...prev, video }))}
        />
      </div>

      {/* Sección de especificaciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('productForm.specifications')}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Select
              label={t('productForm.variantType')}
              options={[
                { value: VARIANT_TYPES.CONFIGURABLE, label: t('productForm.configurable') },
                { value: VARIANT_TYPES.MODEL, label: t('productForm.models') }
              ]}
              value={formData.variantType}
              onChange={(value) => setFormData(prev => ({ ...prev, variantType: value }))}
            />
          </div>
        </div>

        {formData.variantType === VARIANT_TYPES.CONFIGURABLE && (
          <div className="mt-6">
            <ConfigurableProductManager
              product={formData}
              onUpdate={handleConfigurableUpdate}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData?.id ? t('productForm.update') : t('productForm.create')}
        </button>
      </div>
    </form>
  );
};

ProductForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default ProductForm;