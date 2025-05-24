import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const SPEC_WEIGHTS = {
  processor: {
    weight: 0.3,
    compare: (a, b) => {
      if (!a?.selectedComponent || !b?.selectedComponent) return 0;
      // Comparar por nombre del procesador (i3, i5, i7, etc.)
      const rankA = getProcessorRank(a.selectedComponent?.name);
      const rankB = getProcessorRank(b.selectedComponent?.name);
      return rankA - rankB;
    },
    getDifference: (better, worse) => {
      if (!better?.selectedComponent || !worse?.selectedComponent) return [];
      const betterRank = getProcessorRank(better.selectedComponent?.name);
      const worseRank = getProcessorRank(worse.selectedComponent?.name);
      if (betterRank > worseRank) {
        return [`Procesador ${better.selectedComponent.name} (mejor rendimiento)`];
      }
      return [];
    }
  },
  ram: {
    weight: 0.25,
    compare: (a, b) => {
      if (!a?.selectedComponent || !b?.selectedComponent) return 0;
      const sizeA = getRamSize(a.selectedComponent.name);
      const sizeB = getRamSize(b.selectedComponent.name);
      return sizeA - sizeB;
    },
    getDifference: (better, worse) => {
      if (!better?.selectedComponent || !worse?.selectedComponent) return [];
      const sizeDiff = getRamSize(better.selectedComponent.name) - 
                      getRamSize(worse.selectedComponent.name);
      if (sizeDiff > 0) {
        return [`${sizeDiff}GB más de RAM`];
      }
      return [];
    }
  },
  storage: {
    weight: 0.2,
    compare: (a, b) => {
      if (!a?.selectedComponent || !b?.selectedComponent) return 0;
      const sizeA = getStorageSize(a.selectedComponent.name);
      const sizeB = getStorageSize(b.selectedComponent.name);
      const isSsdA = a.selectedComponent.name.toLowerCase().includes('ssd');
      const isSsdB = b.selectedComponent.name.toLowerCase().includes('ssd');
      // Dar prioridad a SSD sobre HDD
      if (isSsdA !== isSsdB) return isSsdA ? 1 : -1;
      return sizeA - sizeB;
    },
    getDifference: (better, worse) => {
      if (!better?.selectedComponent || !worse?.selectedComponent) return [];
      const messages = [];
      const sizeDiff = getStorageSize(better.selectedComponent.name) - 
                      getStorageSize(worse.selectedComponent.name);
      const isSsdBetter = better.selectedComponent.name.toLowerCase().includes('ssd');
      const isSsdWorse = worse.selectedComponent.name.toLowerCase().includes('ssd');
      
      if (sizeDiff > 0) {
        messages.push(sizeDiff >= 1024 ? 
          `${(sizeDiff/1024).toFixed(1)}TB más de almacenamiento` : 
          `${sizeDiff}GB más de almacenamiento`);
      }
      if (isSsdBetter && !isSsdWorse) {
        messages.push('Almacenamiento SSD (más rápido)');
      }
      return messages;
    }
  },
  screen: {
    weight: 0.15,
    compare: (a, b) => {
      if (!a || !b) return 0;
      const sizeA = parseFloat(a.specs?.size?.match(/[\d.]+/)?.[0] || 0);
      const sizeB = parseFloat(b.specs?.size?.match(/[\d.]+/)?.[0] || 0);
      return sizeA - sizeB;
    },
    getDifference: (better, worse) => {
      if (!better || !worse) return [];
      const diff = parseFloat(better.specs?.size?.match(/[\d.]+/)?.[0] || 0) - 
                  parseFloat(worse.specs?.size?.match(/[\d.]+/)?.[0] || 0);
      return diff > 0 ? [`Pantalla ${diff.toFixed(1)}" más grande`] : [];
    }
  },
  graphics: {
    weight: 0.1,
    compare: (a, b) => {
      if (!a || !b) return 0;
      const isDedicatedA = a.specs?.type?.toLowerCase().includes('dedicada') ? 1 : 0;
      const isDedicatedB = b.specs?.type?.toLowerCase().includes('dedicada') ? 1 : 0;
      return isDedicatedA - isDedicatedB;
    },
    getDifference: (better, worse) => {
      if (!better || !worse) return [];
      const isDedicatedBetter = better.specs?.type?.toLowerCase().includes('dedicada');
      const isDedicatedWorse = worse.specs?.type?.toLowerCase().includes('dedicada');
      return isDedicatedBetter && !isDedicatedWorse ? ['GPU dedicada'] : [];
    }
  }
};

// Funciones auxiliares para comparar especificaciones
const getProcessorRank = (name) => {
  if (!name) return 0;
  
  const lowerName = name.toLowerCase();
  if (lowerName.includes('i9')) return 9;
  if (lowerName.includes('i7')) return 7;
  if (lowerName.includes('i5')) return 5;
  if (lowerName.includes('i3')) return 3;
  if (lowerName.includes('ryzen 9')) return 9;
  if (lowerName.includes('ryzen 7')) return 7;
  if (lowerName.includes('ryzen 5')) return 5;
  if (lowerName.includes('ryzen 3')) return 3;
  return 0;
};

const getRamSize = (name) => {
  if (!name) return 0;
  const match = name.match(/(\d+)gb/i);
  return match ? parseInt(match[1]) : 0;
};

const getStorageSize = (name) => {
  if (!name) return 0;
  const match = name.match(/(\d+)(gb|tb)/i);
  if (!match) return 0;
  const [, size, unit] = match;
  return unit.toLowerCase() === 'tb' ? parseInt(size) * 1024 : parseInt(size);
};

const calculateScore = (product) => {
  if (!product?.features) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(SPEC_WEIGHTS).forEach(([spec, { weight }]) => {
    if (product.features[spec]?.selectedComponent) {
      totalScore += weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

const findComparableProducts = (currentProduct, allProducts, options = {}) => {
  if (!currentProduct || !allProducts?.length) return [];

  const {
    maxProducts = 10,
    findBetter = true
  } = options;

  // Filtrar productos de la misma categoría y calcular diferencia de precio
  const productsWithPriceDiff = allProducts
    .filter(product => 
      product.id !== currentProduct.id && 
      product.category === currentProduct.category &&
      typeof product.basePrice === 'number' &&
      typeof currentProduct.basePrice === 'number'
    )
    .map(product => ({
      product,
      priceDiff: Math.abs(product.basePrice - currentProduct.basePrice),
      priceRatio: product.basePrice / currentProduct.basePrice
    }))
    .sort((a, b) => a.priceDiff - b.priceDiff)
    .slice(0, 10);

  // Calcular puntuación y diferencias para cada producto
  const productsWithScores = productsWithPriceDiff.map(({ product, priceDiff, priceRatio }) => {
    let differences = [];
    let totalScore = 0;

    // Comparar características básicas
    if (product.defaultConfiguration && currentProduct.defaultConfiguration) {
      Object.entries(product.defaultConfiguration).forEach(([key, value]) => {
        if (!value) return;
        
        const currentValue = currentProduct.defaultConfiguration[key];
        if (!currentValue) return;

        if (value !== currentValue) {
          // Comparar procesadores
          if (key === 'processor') {
            const rankA = getProcessorRank(value);
            const rankB = getProcessorRank(currentValue);
            const diff = rankA - rankB;
            if (diff !== 0) {
              differences.push(diff > 0 ? 
                `Procesador ${value} (mejor rendimiento)` : 
                `Procesador ${value} (menor rendimiento)`);
              totalScore += diff;
            }
          }
          // Comparar RAM
          else if (key === 'ram') {
            const sizeA = getRamSize(value);
            const sizeB = getRamSize(currentValue);
            const diff = sizeA - sizeB;
            if (diff !== 0) {
              differences.push(diff > 0 ? 
                `${Math.abs(diff)}GB más de RAM` : 
                `${Math.abs(diff)}GB menos de RAM`);
              totalScore += diff;
            }
          }
          // Comparar almacenamiento
          else if (key === 'storage') {
            const sizeA = getStorageSize(value);
            const sizeB = getStorageSize(currentValue);
            const diff = sizeA - sizeB;
            const isSsdA = value?.toLowerCase().includes('ssd') || false;
            const isSsdB = currentValue?.toLowerCase().includes('ssd') || false;
            
            if (diff !== 0) {
              differences.push(diff > 0 ? 
                `${Math.abs(diff)}GB más de almacenamiento` : 
                `${Math.abs(diff)}GB menos de almacenamiento`);
              totalScore += diff / 100;
            }
            if (isSsdA !== isSsdB) {
              differences.push(isSsdA ? 
                'Almacenamiento SSD (más rápido)' : 
                'Almacenamiento HDD (más lento)');
              totalScore += isSsdA ? 5 : -5;
            }
          }
        }
      });
    }

    // Agregar diferencia de precio
    if (isFinite(priceRatio) && priceRatio > 0) {
      differences.push(priceRatio > 1 ? 
        `${((priceRatio - 1) * 100).toFixed(0)}% más caro` :
        `${((1 - priceRatio) * 100).toFixed(0)}% más barato`
      );

      // Ajustar la puntuación total según el precio
      totalScore = totalScore * (1 / Math.max(1, Math.abs(priceRatio - 1)));
    }

    return {
      product,
      differences,
      totalScore,
      priceDiff,
      priceRatio
    };
  });

  return productsWithScores.sort((a, b) => b.totalScore - a.totalScore);
};

const ProductComparison = ({ currentProduct, allProducts }) => {
  const { t } = useTranslation();
  console.log('ProductComparison - Producto actual:', currentProduct);
  console.log('ProductComparison - Todos los productos:', allProducts);

  const comparableProducts = useMemo(() => 
    findComparableProducts(currentProduct, allProducts),
    [currentProduct, allProducts]
  );

  if (!currentProduct || !allProducts?.length) {
    console.log('No hay suficientes datos para comparar productos');
    return null;
  }

  if (!comparableProducts.length) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-medium mb-6">{t('products.compareSimilar')}</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[250px]">
                    {t('products.product')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[150px]">
                    {t('products.reviews')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[100px]">
                    {t('products.price')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[200px]">
                    {t('products.processor')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[150px]">
                    {t('products.ram')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[150px]">
                    {t('products.storage')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[100px]">
                    {t('products.gpu')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[currentProduct, ...comparableProducts.map(p => p.product)].map((product, index) => (
                  <tr key={product.id} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img 
                            src={product.images?.[0]} 
                            alt={product.name}
                            className="h-16 w-16 object-contain rounded"
                          />
        </div>
                        <div className="ml-4 min-w-0">
                          <Link 
                            to={`/producto/${product.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium block truncate"
                          >
                            {product.name}
                          </Link>
        </div>
        </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium mr-1">
                          {product.rating || '4.5'}
                        </span>
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(product.rating || 4.5))}
                          {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
        </div>
                        <span className="text-gray-500 text-sm ml-1">
                          ({product.reviews || '46'})
                        </span>
        </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-900 font-medium">
                        $ {product.basePrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.features?.processor?.selectedComponent?.name || 
                       product.defaultConfiguration?.processor || '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.features?.ram?.selectedComponent?.name || 
                       product.defaultConfiguration?.ram || '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.features?.storage?.selectedComponent?.name || 
                       product.defaultConfiguration?.storage || '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.features?.gpu?.selectedComponent?.name || 
                       product.defaultConfiguration?.gpu || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductComparison.propTypes = {
  currentProduct: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    features: PropTypes.object
  }).isRequired,
  allProducts: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ProductComparison; 