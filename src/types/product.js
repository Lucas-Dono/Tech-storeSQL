// Tipos de variantes
export const VARIANT_TYPES = {
  CONFIGURABLE: 'CONFIGURABLE',
  MODEL: 'MODEL'
};

// Tipos de características configurables
export const FEATURE_TYPES = {
  PROCESSOR: 'processor',
  RAM: 'ram',
  STORAGE: 'storage',
  GPU: 'gpu',
  SCREEN: 'screen',
  COLOR: 'color'
};

// Estructura de producto base
export const DEFAULT_PRODUCT = {
  id: '',
  name: '',
  description: '',
  basePrice: 0,
  images: [],
  category: '',
  stock: 0,
  variantType: VARIANT_TYPES.CONFIGURABLE,
  features: {}, // Para productos configurables
  models: [], // Para productos por modelo
  defaultConfiguration: {} // Configuración por defecto para productos configurables
};

// Ejemplo de estructura para características
export const FEATURE_STRUCTURE = {
  [FEATURE_TYPES.PROCESSOR]: {
    name: 'Procesador',
    options: [
      { value: 'i3', label: 'Intel Core i3', priceIncrement: 0 },
      { value: 'i5', label: 'Intel Core i5', priceIncrement: 100 },
      { value: 'i7', label: 'Intel Core i7', priceIncrement: 200 },
      { value: 'i9', label: 'Intel Core i9', priceIncrement: 400 }
    ]
  },
  [FEATURE_TYPES.RAM]: {
    name: 'Memoria RAM',
    options: [
      { value: '8gb', label: '8GB', priceIncrement: 0 },
      { value: '16gb', label: '16GB', priceIncrement: 50 },
      { value: '32gb', label: '32GB', priceIncrement: 150 },
      { value: '64gb', label: '64GB', priceIncrement: 300 }
    ]
  },
  [FEATURE_TYPES.STORAGE]: {
    name: 'Almacenamiento',
    options: [
      { value: '256gb-ssd', label: '256GB SSD', priceIncrement: 0 },
      { value: '512gb-ssd', label: '512GB SSD', priceIncrement: 50 },
      { value: '1tb-ssd', label: '1TB SSD', priceIncrement: 100 },
      { value: '2tb-ssd', label: '2TB SSD', priceIncrement: 200 }
    ]
  },
  [FEATURE_TYPES.GPU]: {
    name: 'Tarjeta Gráfica',
    options: [
      { value: 'integrated', label: 'Gráficos Integrados', priceIncrement: 0 },
      { value: 'rtx3050', label: 'NVIDIA RTX 3050', priceIncrement: 200 },
      { value: 'rtx3060', label: 'NVIDIA RTX 3060', priceIncrement: 300 },
      { value: 'rtx3070', label: 'NVIDIA RTX 3070', priceIncrement: 500 }
    ]
  }
};

// Utilidades para calcular precios
export const calculateConfigurablePrice = (basePrice, selectedFeatures, featureStructure) => {
  let totalIncrement = 0;
  
  Object.entries(selectedFeatures).forEach(([featureType, selectedValue]) => {
    const feature = featureStructure[featureType];
    if (feature) {
      const option = feature.options.find(opt => opt.value === selectedValue);
      if (option) {
        totalIncrement += option.priceIncrement;
      }
    }
  });
  
  return basePrice + totalIncrement;
};

// Validar configuración de producto
export const validateProductConfiguration = (product) => {
  if (!product) return false;
  
  if (product.variantType === VARIANT_TYPES.CONFIGURABLE) {
    return product.features && 
           Object.keys(product.features).length > 0 && 
           product.defaultConfiguration;
  }
  
  if (product.variantType === VARIANT_TYPES.MODEL) {
    return Array.isArray(product.models) && 
           product.models.length > 0;
  }
  
  return false;
};

export const CURRENCIES = {
  ARS: {
    symbol: 'AR$',
    name: 'Peso Argentino',
    code: 'ARS'
  },
  USD: {
    symbol: 'US$',
    name: 'Dólar Estadounidense',
    code: 'USD'
  },
  BRL: {
    symbol: 'R$',
    name: 'Real Brasileño',
    code: 'BRL'
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    code: 'EUR'
  }
};

export const DEFAULT_CURRENCY = 'ARS'; 