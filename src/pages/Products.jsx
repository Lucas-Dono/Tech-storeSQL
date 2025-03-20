import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Select from '../components/common/Select';
import { useTranslation } from 'react-i18next';

const Products = () => {
  const { t } = useTranslation();
  const { products, isLoading } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category')?.toLowerCase() || 'all'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Obtener categorías únicas de los productos y normalizarlas
  const categories = ['all', ...new Set(products?.map(product => 
    product.category.toLowerCase()
  ) || [])];

  // Actualizar URL cuando cambie la categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    navigate(`/productos?${newParams.toString()}`);
  };

  // Actualizar URL cuando cambie la búsqueda
  const handleSearchChange = (search) => {
    setSearchTerm(search);
    const newParams = new URLSearchParams(searchParams);
    if (!search) {
      newParams.delete('search');
    } else {
      newParams.set('search', search);
    }
    navigate(`/productos?${newParams.toString()}`);
  };

  useEffect(() => {
    if (products) {
      let filtered = [...products];

      // Filtrar por categoría
      if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(product => 
          product.category.toLowerCase() === selectedCategory
        );
      }

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(product => {
          const searchableFields = [
            product.name,
            product.description,
            product.category,
            ...(product.features ? Object.values(product.features).map(f => f.name) : [])
          ].filter(Boolean);

          return searchableFields.some(field => 
            String(field).toLowerCase().includes(searchLower)
          );
        });
      }

      // Procesar los productos para asegurar que tengan la estructura correcta
      const processedProducts = filtered.map(product => {
        // Asegurarse de que las imágenes sean strings
        const images = Array.isArray(product.images) 
          ? product.images.filter(img => typeof img === 'string')
          : [];
        
        // Asegurarse de que la imagen principal sea string
        const mainImage = typeof product.image === 'string' ? product.image : '';
        
        // Asegurarse de que el video sea string
        const video = typeof product.video === 'string' ? product.video : 
                     typeof product.videoUrl === 'string' ? product.videoUrl : '';
        
        return {
          ...product,
          images: images,
          image: images[0] || mainImage || '/placeholder-image.jpg',
          video: video
        };
      });

      setFilteredProducts(processedProducts);
    }
  }, [products, selectedCategory, searchTerm]);

  // Actualizar estado cuando cambien los parámetros de URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')?.toLowerCase();
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam || 'all');
    }
    
    const searchParam = searchParams.get('search');
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam || '');
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtros y búsqueda */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-shrink-0">
          <Select
            options={categories.map(category => ({
              value: category,
              label: category === 'all' ? t('products.filterByCategory') : category
            }))}
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full md:w-auto"
          />
        </div>
      </div>

      {/* Resultados de la búsqueda */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredProducts.length} 
          {filteredProducts.length === 1 ? t('products.unit') : t('products.units')}
          {selectedCategory !== 'all' && ` ${t('products.in')} ${selectedCategory}`}
          {searchTerm && ` ${t('products.for')} "${searchTerm}"`}
        </p>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product._id || product.id}
            product={{
              ...product,
              id: product._id || product.id
            }}
          />
        ))}
        {filteredProducts.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 text-lg">
              {t('products.noProducts')}
              {selectedCategory !== 'all' && ` ${t('products.in')} ${selectedCategory}`}
              {searchTerm && ` ${t('products.matching')} "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
