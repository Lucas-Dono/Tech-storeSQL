import { prisma } from '../lib/prisma';

// Pesos para el cálculo de similitud
const COMPARISON_WEIGHTS = {
  price: 0.3,
  features: 0.4,
  specifications: 0.3
};

// Pesos para características específicas
const FEATURE_WEIGHTS = {
  processor: 0.25,
  ram: 0.2,
  storage: 0.2,
  screen: 0.15,
  graphics: 0.1,
  connectivity: 0.1
};

// Rangos de precios para productos comparables
const PRICE_RANGES = {
  min: 0.7, // 70% del precio base
  max: 1.3  // 130% del precio base
};

export const productComparisonService = {
  /**
   * Obtiene productos comparables basados en un producto base
   * @param {string} baseProductId - ID del producto base
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} - Lista de productos comparables
   */
  async getComparableProducts(baseProductId, options = {}) {
    const baseProduct = await prisma.product.findUnique({
      where: { id: baseProductId },
      include: {
        category: true,
        features: true
      }
    });

    if (!baseProduct) {
      throw new Error('Producto base no encontrado');
    }

    const priceRange = {
      min: baseProduct.basePrice * PRICE_RANGES.min,
      max: baseProduct.basePrice * PRICE_RANGES.max
    };

    // Buscar productos en el mismo rango de precio y categoría
    const comparableProducts = await prisma.product.findMany({
      where: {
        id: { not: baseProductId },
        categoryId: baseProduct.categoryId,
        basePrice: {
          gte: priceRange.min,
          lte: priceRange.max
        }
      },
      include: {
        category: true,
        features: true
      },
      take: options.limit || 10
    });

    // Calcular puntuación de similitud para cada producto
    const productsWithScore = await Promise.all(
      comparableProducts.map(async (product) => {
        const comparison = await this.compareProducts(baseProduct, product);
        return {
          ...product,
          similarityScore: comparison.similarityScore
        };
      })
    );

    // Ordenar por puntuación de similitud
    return productsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);
  },

  /**
   * Compara dos productos y genera un análisis detallado
   * @param {Object} product1 - Primer producto
   * @param {Object} product2 - Segundo producto
   * @returns {Promise<Object>} - Resultado de la comparación
   */
  async compareProducts(product1, product2) {
    const priceComparison = this.comparePrices(product1, product2);
    const featuresComparison = this.compareFeatures(product1, product2);
    const specificationsComparison = this.compareSpecifications(product1, product2);

    // Calcular puntuación de similitud
    const similarityScore = this.calculateSimilarityScore(
      priceComparison,
      featuresComparison,
      specificationsComparison
    );

    // Generar ventajas para cada producto
    const advantages = this.generateAdvantages(
      product1,
      product2,
      priceComparison,
      featuresComparison,
      specificationsComparison
    );

    return {
      price: priceComparison,
      features: featuresComparison,
      specifications: specificationsComparison,
      similarityScore,
      advantages
    };
  },

  /**
   * Compara los precios de dos productos
   * @param {Object} product1 - Primer producto
   * @param {Object} product2 - Segundo producto
   * @returns {Object} - Comparación de precios
   */
  comparePrices(product1, product2) {
    const priceDifference = product2.basePrice - product1.basePrice;
    const percentageDifference = (priceDifference / product1.basePrice) * 100;

    return {
      product1Price: product1.basePrice,
      product2Price: product2.basePrice,
      priceDifference,
      percentageDifference,
      product1Advantage: priceDifference > 0,
      product2Advantage: priceDifference < 0
    };
  },

  /**
   * Compara las características de dos productos
   * @param {Object} product1 - Primer producto
   * @param {Object} product2 - Segundo producto
   * @returns {Array} - Comparación de características
   */
  compareFeatures(product1, product2) {
    const features = [];
    const product1Features = this.processFeatures(product1.features);
    const product2Features = this.processFeatures(product2.features);

    // Comparar características comunes
    Object.keys(FEATURE_WEIGHTS).forEach(featureKey => {
      const feature1 = product1Features[featureKey];
      const feature2 = product2Features[featureKey];

      if (feature1 && feature2) {
        const comparison = this.compareFeatureValues(feature1, feature2);
        features.push({
          name: this.getFeatureDisplayName(featureKey),
          product1Value: feature1.value,
          product2Value: feature2.value,
          product1Advantage: comparison.product1Advantage,
          product2Advantage: comparison.product2Advantage
        });
      }
    });

    return features;
  },

  /**
   * Compara las especificaciones de dos productos
   * @param {Object} product1 - Primer producto
   * @param {Object} product2 - Segundo producto
   * @returns {Array} - Comparación de especificaciones
   */
  compareSpecifications(product1, product2) {
    const specifications = [];
    const product1Specs = this.processSpecifications(product1.features);
    const product2Specs = this.processSpecifications(product2.features);

    // Comparar especificaciones comunes
    Object.keys(product1Specs).forEach(specKey => {
      if (product2Specs[specKey]) {
        const spec1 = product1Specs[specKey];
        const spec2 = product2Specs[specKey];

        const comparison = this.compareSpecificationValues(spec1, spec2);
        specifications.push({
          name: this.getSpecificationDisplayName(specKey),
          product1Value: spec1.value,
          product2Value: spec2.value,
          product1Advantage: comparison.product1Advantage,
          product2Advantage: comparison.product2Advantage
        });
      }
    });

    return specifications;
  },

  /**
   * Calcula la puntuación de similitud entre dos productos
   * @param {Object} priceComparison - Comparación de precios
   * @param {Array} featuresComparison - Comparación de características
   * @param {Array} specificationsComparison - Comparación de especificaciones
   * @returns {number} - Puntuación de similitud (0-1)
   */
  calculateSimilarityScore(priceComparison, featuresComparison, specificationsComparison) {
    // Calcular similitud de precio
    const priceSimilarity = 1 - Math.abs(priceComparison.percentageDifference) / 100;

    // Calcular similitud de características
    const featuresSimilarity = featuresComparison.reduce((acc, feature) => {
      const weight = FEATURE_WEIGHTS[feature.name.toLowerCase()] || 0.1;
      return acc + (feature.product1Value === feature.product2Value ? weight : 0);
    }, 0);

    // Calcular similitud de especificaciones
    const specificationsSimilarity = specificationsComparison.reduce((acc, spec) => {
      return acc + (spec.product1Value === spec.product2Value ? 1 : 0);
    }, 0) / specificationsComparison.length;

    // Calcular puntuación final
    return (
      priceSimilarity * COMPARISON_WEIGHTS.price +
      featuresSimilarity * COMPARISON_WEIGHTS.features +
      specificationsSimilarity * COMPARISON_WEIGHTS.specifications
    );
  },

  /**
   * Genera las ventajas de cada producto basado en la comparación
   * @param {Object} product1 - Primer producto
   * @param {Object} product2 - Segundo producto
   * @param {Object} priceComparison - Comparación de precios
   * @param {Array} featuresComparison - Comparación de características
   * @param {Array} specificationsComparison - Comparación de especificaciones
   * @returns {Object} - Ventajas de cada producto
   */
  generateAdvantages(product1, product2, priceComparison, featuresComparison, specificationsComparison) {
    const advantages = {
      product1: [],
      product2: []
    };

    // Ventajas de precio
    if (priceComparison.product1Advantage) {
      advantages.product1.push(`Más económico (${Math.abs(priceComparison.percentageDifference).toFixed(1)}% menos)`);
    } else if (priceComparison.product2Advantage) {
      advantages.product2.push(`Más económico (${Math.abs(priceComparison.percentageDifference).toFixed(1)}% menos)`);
    }

    // Ventajas de características
    featuresComparison.forEach(feature => {
      if (feature.product1Advantage) {
        advantages.product1.push(`Mejor ${feature.name.toLowerCase()}`);
      } else if (feature.product2Advantage) {
        advantages.product2.push(`Mejor ${feature.name.toLowerCase()}`);
      }
    });

    // Ventajas de especificaciones
    specificationsComparison.forEach(spec => {
      if (spec.product1Advantage) {
        advantages.product1.push(`Mejor ${spec.name.toLowerCase()}`);
      } else if (spec.product2Advantage) {
        advantages.product2.push(`Mejor ${spec.name.toLowerCase()}`);
      }
    });

    return advantages;
  },

  // Funciones auxiliares
  processFeatures(features) {
    const processed = {};
    features.forEach(feature => {
      processed[feature.type] = {
        value: feature.value,
        unit: feature.unit
      };
    });
    return processed;
  },

  processSpecifications(features) {
    const processed = {};
    features.forEach(feature => {
      if (feature.specifications) {
        Object.entries(feature.specifications).forEach(([key, value]) => {
          processed[key] = { value };
        });
      }
    });
    return processed;
  },

  compareFeatureValues(feature1, feature2) {
    // Implementar lógica de comparación específica para cada tipo de característica
    const value1 = this.normalizeValue(feature1.value);
    const value2 = this.normalizeValue(feature2.value);

    return {
      product1Advantage: value1 > value2,
      product2Advantage: value2 > value1
    };
  },

  compareSpecificationValues(spec1, spec2) {
    const value1 = this.normalizeValue(spec1.value);
    const value2 = this.normalizeValue(spec2.value);

    return {
      product1Advantage: value1 > value2,
      product2Advantage: value2 > value1
    };
  },

  normalizeValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Convertir valores como "8GB" a números
      const match = value.match(/^(\d+)([A-Za-z]+)$/);
      if (match) {
        const [, number, unit] = match;
        const multiplier = this.getUnitMultiplier(unit);
        return parseInt(number) * multiplier;
      }
    }
    return 0;
  },

  getUnitMultiplier(unit) {
    const multipliers = {
      'GB': 1,
      'TB': 1024,
      'MHz': 1,
      'GHz': 1000,
      'MB': 1,
      'KB': 0.001
    };
    return multipliers[unit] || 1;
  },

  getFeatureDisplayName(key) {
    const names = {
      processor: 'Procesador',
      ram: 'Memoria RAM',
      storage: 'Almacenamiento',
      screen: 'Pantalla',
      graphics: 'Gráficos',
      connectivity: 'Conectividad'
    };
    return names[key] || key;
  },

  getSpecificationDisplayName(key) {
    const names = {
      resolution: 'Resolución',
      refreshRate: 'Tasa de refresco',
      batteryLife: 'Duración de batería',
      weight: 'Peso',
      dimensions: 'Dimensiones'
    };
    return names[key] || key;
  }
}; 