import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../context/StoreContext';
import ProductForm from '../../components/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addProduct } = useStore();

  const handleSubmit = async (productData) => {
    try {
      await addProduct(productData);
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error al crear el producto:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/productos')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {t('admin.addProduct')}
        </h1>

        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateProduct; 