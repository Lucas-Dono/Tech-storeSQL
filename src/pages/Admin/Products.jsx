import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import ConfigurableProductManager from '../../components/admin/ConfigurableProductManager';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import Select from '../../components/common/Select';
import { CURRENCIES, DEFAULT_CURRENCY } from '../../types/product';
import { Link } from 'react-router-dom';
import ProductForm from '../../components/ProductForm';

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
      console.log('Datos recibidos para guardar:', productData);

      // Procesar el precio base
      const basePrice = Number(productData.basePrice.toString().replace(/\./g, '').replace(',', '.'));

      // Asegurarse de que las características estén en el formato correcto
      const features = {};
      if (productData.features) {
        Object.entries(productData.features).forEach(([category, data]) => {
          if (data.selectedComponent) {
            features[category] = {
              selectedComponent: {
                ...data.selectedComponent,
                category: category // Asegurarse de que la categoría esté incluida
              }
            };
          }
        });
      }

      const processedData = {
        ...productData,
        basePrice,
        features, // Incluir las características procesadas
        variantType: 'CONFIGURABLE'
      };

      console.log('Datos procesados para enviar:', processedData);

      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        if (!productId) {
          throw new Error('ID de producto no válido');
        }
        await updateProduct(productId, processedData);
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
    console.log('Intentando eliminar producto con ID:', productId);
    
    if (!productId) {
      console.error('ID de producto no válido');
      error(t('adminProducts.deleteError'));
      return;
    }

    if (window.confirm(t('adminProducts.confirmDelete'))) {
      try {
        console.log('Iniciando eliminación del producto:', productId);
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
          {filteredProducts.map((product) => {
            const productId = product.id || product._id;
            return (
              <div
                key={`product-${productId}`}
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
                      onClick={() => {
                        const productToEdit = {
                          ...product,
                          id: product._id || product.id
                        };
                        setEditingProduct(productToEdit);
                      }}
                      className={`${editingProduct?._id === productId ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const idToDelete = product.id || product._id;
                        console.log('ID del producto a eliminar:', idToDelete);
                        handleProductDelete(idToDelete);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {editingProduct?._id === productId && (
                  <div className="border-t pt-4">
                    <ProductForm
                      initialData={editingProduct}
                      onSubmit={handleProductSubmit}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
