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
  SCREEN: 'screen',
  BATTERY: 'battery',
  SECURITY: 'security',
  GAMING: 'gaming',
  ADDITIONAL_FEATURES: 'additionalFeatures'
};

// Estructura de producto base
export const DEFAULT_PRODUCT = {
  name: '',
  description: '',
  basePrice: 0,
  images: [],
  video: null,
  category: '',
  stock: 0,
  variantType: VARIANT_TYPES.CONFIGURABLE,
  features: {}, // Para productos configurables
  models: [], // Para productos por modelo
  defaultConfiguration: {} // Configuración por defecto para productos configurables
};

// Estructura de especificaciones
export const SPECIFICATIONS_STRUCTURE = {
  processors: {
    mobile: [
      {
        name: 'Snapdragon 8 Gen 3',
        brand: 'Qualcomm',
        description: {
          es: 'Procesador de última generación para dispositivos móviles',
          en: 'Latest generation processor for mobile devices'
        },
        specs: {
          cores: '8',
          architecture: '4nm',
          maxSpeed: '3.3 GHz'
        },
        priceIncrement: 0
      },
      // Añadir más procesadores aquí
    ]
  },
  ram: {
    mobile: [
      {
        name: '8GB LPDDR5X',
        brand: 'Samsung',
        description: {
          es: 'Memoria RAM de alta velocidad',
          en: 'High-speed RAM memory'
        },
        specs: {
          capacity: '8GB',
          type: 'LPDDR5X',
          speed: '8533 MHz'
        },
        priceIncrement: 0
      },
      // Añadir más opciones de RAM aquí
    ]
  },
  storage: {
    mobile: [
      {
        name: '256GB UFS 4.0',
        brand: 'Samsung',
        description: {
          es: 'Almacenamiento ultrarrápido',
          en: 'Ultra-fast storage'
        },
        specs: {
          capacity: '256GB',
          type: 'UFS 4.0',
          readSpeed: '4200 MB/s'
        },
        priceIncrement: 0
      },
      // Añadir más opciones de almacenamiento aquí
    ]
  },
  screen: {
    mobile: [
      {
        name: 'AMOLED 6.8"',
        brand: 'Samsung',
        description: {
          es: 'Pantalla AMOLED de alta resolución',
          en: 'High-resolution AMOLED display'
        },
        specs: {
          size: '6.8"',
          resolution: '3088 x 1440',
          refreshRate: '120Hz'
        },
        priceIncrement: 0
      },
      // Añadir más opciones de pantalla aquí
    ]
  },
  battery: {
    mobile: [
      {
        name: '5000mAh',
        brand: 'Samsung',
        description: {
          es: 'Batería de alta capacidad',
          en: 'High-capacity battery'
        },
        specs: {
          capacity: '5000mAh',
          chargingSpeed: '45W',
          wirelessCharging: '15W'
        },
        priceIncrement: 0
      },
      // Añadir más opciones de batería aquí
    ]
  },
  security: {
    mobile: [
      {
        name: 'Huella Digital + Face ID',
        brand: 'Samsung',
        description: {
          es: 'Sistema de seguridad biométrico',
          en: 'Biometric security system'
        },
        specs: {
          fingerprint: 'Ultrasonic',
          faceRecognition: '3D',
          securityLevel: 'High'
        },
        priceIncrement: 0
      },
      // Añadir más opciones de seguridad aquí
    ]
  },
  gaming: {
    mobile: [
      {
        name: 'Gaming Mode',
        brand: 'Samsung',
        description: {
          es: 'Modo gaming optimizado',
          en: 'Optimized gaming mode'
        },
        specs: {
          cooling: 'Vapor Chamber',
          performance: 'Enhanced',
          features: ['Game Launcher', 'Game Tools']
        },
        priceIncrement: 0
      },
      // Añadir más opciones de gaming aquí
    ]
  },
  additionalFeatures: {
    mobile: {
      biometrics: [
        {
          name: 'Huella Digital',
          description: {
            es: 'Sensor de huella digital ultrasónico',
            en: 'Ultrasonic fingerprint sensor'
          },
          specs: {
            type: 'Ultrasonic',
            speed: 'Fast',
            security: 'High'
          }
        }
      ],
      sound: [
        {
          name: 'Dolby Atmos',
          description: {
            es: 'Sistema de audio inmersivo',
            en: 'Immersive audio system'
          },
          specs: {
            type: 'Stereo',
            quality: 'High',
            features: ['Dolby Atmos', 'Hi-Res Audio']
          }
        }
      ],
      connectivity: [
        {
          name: '5G',
          description: {
            es: 'Conectividad 5G',
            en: '5G connectivity'
          },
          specs: {
            type: '5G',
            bands: 'Multi-band',
            speed: 'High'
          }
        }
      ],
      protection: [
        {
          name: 'IP68',
          description: {
            es: 'Protección contra agua y polvo',
            en: 'Water and dust protection'
          },
          specs: {
            rating: 'IP68',
            waterResistance: '1.5m for 30min',
            dustResistance: 'Complete'
          }
        }
      ],
      security: [
        {
          name: 'Knox',
          description: {
            es: 'Sistema de seguridad Samsung Knox',
            en: 'Samsung Knox security system'
          },
          specs: {
            level: 'Enterprise',
            features: ['Secure Folder', 'Real-time Protection']
          }
        }
      ],
      gaming: [
        {
          name: 'Game Launcher',
          description: {
            es: 'Centro de juegos optimizado',
            en: 'Optimized gaming center'
          },
          specs: {
            features: ['Performance Mode', 'Game Tools'],
            optimization: 'High'
          }
        }
      ]
    }
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