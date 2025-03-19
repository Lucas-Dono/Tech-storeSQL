import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import ConfigurableProductManager from '../../components/admin/ConfigurableProductManager';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import Select from '../../components/common/Select';
import { CURRENCIES, DEFAULT_CURRENCY } from '../../types/product';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const { t } = useTranslation();
  const { error, success } = useAlert();
  const { products = [], addProduct, updateProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(products)) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setIsLoading(false);
    }
  }, [products, searchTerm]);

  const handleProductSubmit = async (productData) => {
    try {
      const processedData = {
        ...productData,
        basePrice: Number(productData.basePrice)
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, processedData);
        success(t('adminProducts.saveSuccess'));
      } else {
        await addProduct(processedData);
        success(t('adminProducts.saveSuccess'));
      }
      setEditingProduct(null);
    } catch (err) {
      console.error('Error al guardar el producto:', err);
      error(t('adminProducts.saveError'));
    }
  };

  const handleProductDelete = async (productId) => {
    if (window.confirm(t('adminProducts.confirmDelete'))) {
      try {
        await deleteProduct(productId);
        success(t('adminProducts.deleteSuccess'));
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        error(t('adminProducts.deleteError'));
      }
    }
  };

  const formatNumber = (value) => {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const [integerPart, decimalPart] = cleanValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('adminProducts.title')}
        </h1>
        <Link
          to="/admin/create-product"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('adminProducts.addProduct')}
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('adminProducts.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t('adminProducts.noProducts')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                  <p className="text-gray-600">{product.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">{t('productForm.price')}:</span>
                      <span className="ml-2 font-medium">
                        {product.currency} {formatNumber(product.basePrice.toString())}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('productForm.stock')}:</span>
                      <span className="ml-2 font-medium">{product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingProduct(editingProduct?.id === product.id ? null : product)}
                    className={`${editingProduct?.id === product.id ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleProductDelete(product.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {editingProduct?.id === product.id && (
                <>
                  <div className="border-t pt-4 mb-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('Nombre del producto')}
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, { ...product, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Select
                          label={t('productForm.category')}
                          options={[
                            { value: '', label: 'Seleccionar categoría' },
                            { value: 'Laptops', label: 'Laptops' },
                            { value: 'Smartphones', label: 'Smartphones' },
                            { value: 'Tablets', label: 'Tablets' },
                            { value: 'Accesorios', label: 'Accesorios' }
                          ]}
                          value={product.category}
                          onChange={(value) => updateProduct(product.id, { ...product, category: value })}
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
                            value={product.currency || DEFAULT_CURRENCY}
                            onChange={(value) => updateProduct(product.id, { ...product, currency: value })}
                            className="w-32"
                          />
                          <input
                            type="text"
                            value={formatNumber(product.basePrice.toString())}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!/^[\d.,]*$/.test(value)) return;
                              try {
                                const formattedValue = formatNumber(value);
                                updateProduct(product.id, { 
                                  ...product, 
                                  basePrice: parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) 
                                });
                              } catch (error) {
                                console.error('Error al formatear número:', error);
                              }
                            }}
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
                          value={product.stock}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!/^\d*$/.test(value)) return;
                            updateProduct(product.id, { ...product, stock: value });
                          }}
                          placeholder="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Descripciones */}
                    <div className="mt-6 space-y-6">
                      {/* Descripción en español */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('productForm.descriptionEs')}
                        </label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, { ...product, description: e.target.value })}
                          rows="3"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Descripción en inglés */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('productForm.descriptionEn')}
                        </label>
                        <textarea
                          value={product.description_en || ''}
                          onChange={(e) => updateProduct(product.id, { ...product, description_en: e.target.value })}
                          rows="3"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <ConfigurableProductManager
                      product={product}
                      onUpdate={async (updatedProduct) => {
                        await updateProduct(updatedProduct.id, updatedProduct);
                        setEditingProduct(null);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
