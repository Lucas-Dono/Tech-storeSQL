import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { productComparisonService } from '../services/productComparisonService';

const ProductComparisonModal = ({ isOpen, onClose, baseProduct, onProductSelect }) => {
  const { t } = useTranslation();
  const [comparableProducts, setComparableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    if (isOpen && baseProduct) {
      loadComparableProducts();
    }
  }, [isOpen, baseProduct]);

  const loadComparableProducts = async () => {
    setLoading(true);
    try {
      const products = await productComparisonService.getComparableProducts(baseProduct.id);
      setComparableProducts(products);
    } catch (error) {
      console.error('Error loading comparable products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    try {
      const comparisonResult = await productComparisonService.compareProducts(baseProduct, product);
      setComparison(comparisonResult);
    } catch (error) {
      console.error('Error comparing products:', error);
    }
  };

  const renderComparisonSection = (title, data) => (
    <div className="border-t border-gray-200 py-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 ${item.product1Advantage ? 'text-green-600' : 'text-gray-600'}`}>
                <span className="text-sm font-medium">{item.product1Value}</span>
                {item.product1Advantage && <CheckIcon className="h-4 w-4" />}
              </div>
              <span className="text-sm text-gray-400">vs</span>
              <div className={`flex items-center space-x-2 ${item.product2Advantage ? 'text-green-600' : 'text-gray-600'}`}>
                <span className="text-sm font-medium">{item.product2Value}</span>
                {item.product2Advantage && <CheckIcon className="h-4 w-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">{t('close')}</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                      {t('compareProducts')}
                    </Dialog.Title>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Producto Base */}
                      <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg font-medium mb-4 text-gray-900">{baseProduct.name}</h4>
                        <div className="relative aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={baseProduct.images[0]}
                            alt={baseProduct.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${baseProduct.basePrice.toLocaleString()}
                        </p>
                      </div>

                      {/* Producto a Comparar */}
                      <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        {selectedProduct ? (
                          <>
                            <h4 className="text-lg font-medium mb-4 text-gray-900">{selectedProduct.name}</h4>
                            <div className="relative aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
                              <img
                                src={selectedProduct.images[0]}
                                alt={selectedProduct.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              ${selectedProduct.basePrice.toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <ArrowPathIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">{t('selectProductToCompare')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lista de Productos Comparables */}
                    <div className="mt-8">
                      <h4 className="text-lg font-medium mb-4 text-gray-900">{t('comparableProducts')}</h4>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {comparableProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductSelect(product)}
                              className={`p-4 border rounded-lg transition-all duration-200 ${
                                selectedProduct?.id === product.id
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : 'hover:border-blue-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${product.basePrice.toLocaleString()}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resultados de la Comparación */}
                    {comparison && (
                      <div className="mt-8 space-y-6">
                        <h4 className="text-xl font-medium text-gray-900">{t('comparisonResults')}</h4>
                        
                        {/* Resumen */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h5 className="text-lg font-medium mb-4 text-gray-900">{t('summary')}</h5>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-600 mb-2">{t('priceDifference')}</p>
                              <p className={`text-xl font-medium ${
                                comparison.price.priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ${Math.abs(comparison.price.priceDifference).toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-600 mb-2">{t('similarityScore')}</p>
                              <p className="text-xl font-medium text-gray-900">
                                {Math.round(comparison.similarityScore * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Características */}
                        {renderComparisonSection(t('features'), comparison.features)}

                        {/* Especificaciones */}
                        {renderComparisonSection(t('specifications'), comparison.specifications)}

                        {/* Ventajas */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border rounded-lg p-6 bg-white shadow-sm">
                            <h5 className="text-lg font-medium mb-4 text-gray-900">
                              {t('advantagesOf')} {baseProduct.name}
                            </h5>
                            <ul className="space-y-3">
                              {comparison.advantages.product1.map((advantage, index) => (
                                <li key={index} className="flex items-center text-green-600">
                                  <CheckIcon className="h-5 w-5 mr-2" />
                                  <span className="text-sm">{advantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border rounded-lg p-6 bg-white shadow-sm">
                            <h5 className="text-lg font-medium mb-4 text-gray-900">
                              {t('advantagesOf')} {selectedProduct.name}
                            </h5>
                            <ul className="space-y-3">
                              {comparison.advantages.product2.map((advantage, index) => (
                                <li key={index} className="flex items-center text-green-600">
                                  <CheckIcon className="h-5 w-5 mr-2" />
                                  <span className="text-sm">{advantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ProductComparisonModal; 