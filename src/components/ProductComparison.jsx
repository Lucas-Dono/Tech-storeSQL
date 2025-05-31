import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ProductComparison = ({ currentProduct, comparableProducts }) => {
  const { t } = useTranslation();

  if (!comparableProducts?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('products.compareSimilar')}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.product')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.price')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.processor')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.ram')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.storage')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.screen')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.gpu')}
              </th>
              <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.additionalFeatures')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Producto actual */}
            <tr className="bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <img
                      className="h-12 w-12 rounded-lg object-cover border-2 border-blue-500"
                      src={currentProduct.images?.[0]}
                      alt={currentProduct.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {currentProduct.name}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {t('products.currentProduct')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">${currentProduct.basePrice.toLocaleString()}</div>
              </td>
              {renderFeatureCell(currentProduct.features?.processor)}
              {renderFeatureCell(currentProduct.features?.ram)}
              {renderFeatureCell(currentProduct.features?.storage)}
              {renderFeatureCell(currentProduct.features?.screen)}
              {renderFeatureCell(currentProduct.features?.graphics)}
              {renderAdditionalFeatures(currentProduct.features?.additionalFeatures)}
            </tr>

            {/* Productos comparables */}
            {comparableProducts.map(({ product, comparison }) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                        src={product.images?.[0]}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <Link
                        to={`/producto/${product.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {comparison.priceComparison.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${product.basePrice.toLocaleString()}</div>
                  <div className={`text-xs font-medium ${
                    comparison.priceComparison.isBetter ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {comparison.priceComparison.description}
                  </div>
                </td>
                {renderFeatureCell(product.features?.processor, comparison.featureComparison.processor)}
                {renderFeatureCell(product.features?.ram, comparison.featureComparison.ram)}
                {renderFeatureCell(product.features?.storage, comparison.featureComparison.storage)}
                {renderFeatureCell(product.features?.screen, comparison.featureComparison.screen)}
                {renderFeatureCell(product.features?.graphics, comparison.featureComparison.graphics)}
                {renderAdditionalFeatures(product.features?.additionalFeatures, comparison.featureComparison.additionalFeatures)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen de diferencias */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('products.comparisonSummary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparableProducts.map(({ product, comparison }) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 mb-3">{product.name}</h4>
              <ul className="space-y-2">
                {comparison.differences.map((diff, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    {diff.isBetter ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <span>{diff.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares
const renderFeatureCell = (feature, comparison = null) => {
  if (!feature?.selectedComponent) {
    return <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>;
  }

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{feature.selectedComponent.name}</div>
      {comparison && (
        <div className={`text-xs font-medium flex items-center mt-1 ${
          comparison.isBetter ? 'text-green-600' : 'text-red-600'
        }`}>
          {comparison.isBetter ? (
            <CheckIcon className="h-4 w-4 mr-1" />
          ) : (
            <XMarkIcon className="h-4 w-4 mr-1" />
          )}
          {comparison.description}
        </div>
      )}
    </td>
  );
};

const renderAdditionalFeatures = (features, comparison = null) => {
  if (!features) {
    return <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>;
  }

  const featureList = Object.entries(features)
    .flatMap(([category, items]) => items.map(item => item.name))
    .join(', ');

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{featureList}</div>
      {comparison && comparison.advantages && comparison.advantages.length > 0 && (
        <div className="text-xs font-medium text-green-600 flex items-center mt-1">
          <CheckIcon className="h-4 w-4 mr-1" />
          {t('products.uniqueFeatures')}
        </div>
      )}
    </td>
  );
};

ProductComparison.propTypes = {
  currentProduct: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    features: PropTypes.object
  }).isRequired,
  comparableProducts: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.object.isRequired,
      comparison: PropTypes.object.isRequired
    })
  ).isRequired
};

export default ProductComparison; 