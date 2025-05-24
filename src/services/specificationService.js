import specifications from '../data/specifications.json';

export const specificationService = {
  // Obtener todas las especificaciones
  getAllSpecifications() {
    return specifications;
  },

  // Obtener especificaciones por tipo (mobile/desktop)
  getSpecificationsByType(type) {
    const result = {};
    for (const category in specifications) {
      if (specifications[category][type]) {
        result[category] = specifications[category][type];
      }
    }
    return result;
  },

  // Buscar especificaciones por término de búsqueda
  searchSpecifications(category, type, searchTerm) {
    if (!specifications[category] || !specifications[category][type]) {
      return [];
    }
    const items = specifications[category][type];

    if (!searchTerm) return items;
    const normalizedSearch = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(normalizedSearch) ||
      (item.brand && item.brand.toLowerCase().includes(normalizedSearch))
    );
  },

  // Generar descripción detallada de un producto
  generateProductDescription(product) {
    const descriptions = [];
    const type = product.category.toLowerCase();

    for (const category in product.specs) {
      const spec = product.specs[category];
      if (!spec) continue;

      const categorySpecs = specifications[category]?.[type];
      if (!categorySpecs) continue;

      const fullSpec = categorySpecs.find(s => s.id === spec.id);
      if (!fullSpec) continue;

      // Agregar descripción del componente
      const componentDesc = Object.values(fullSpec.description).join('. ');
      descriptions.push(`${fullSpec.name} de ${fullSpec.brand}: ${componentDesc}`);

      // Agregar ventajas principales
      if (fullSpec.advantages && fullSpec.advantages.length > 0) {
        descriptions.push(`Ventajas principales: ${fullSpec.advantages.join(', ')}.`);
      }
    }

    return descriptions.join('\n\n');
  },

  // Comparar productos basado en ranking
  compareProducts(product1, product2) {
    const comparison = {
      winner: null,
      advantages: {
        product1: [],
        product2: []
      },
      details: {}
    };

    // Comparar cada categoría de especificaciones
    for (const category in product1.specs) {
      const spec1 = product1.specs[category];
      const spec2 = product2.specs[category];
      
      if (!spec1 || !spec2) continue;

      const type = product1.category.toLowerCase();
      const categorySpecs = specifications[category]?.[type];
      if (!categorySpecs) continue;

      const fullSpec1 = categorySpecs.find(s => s.id === spec1.id);
      const fullSpec2 = categorySpecs.find(s => s.id === spec2.id);
      
      if (!fullSpec1 || !fullSpec2) continue;

      comparison.details[category] = {
        spec1: fullSpec1,
        spec2: fullSpec2,
        differences: this.compareSpecs(fullSpec1, fullSpec2)
      };

      // Analizar ventajas basadas en ranking
      if (fullSpec1.ranking < fullSpec2.ranking) {
        comparison.advantages.product1.push({
          category,
          description: `Mejor ${category}`,
          details: fullSpec1.advantages
        });
      } else if (fullSpec2.ranking < fullSpec1.ranking) {
        comparison.advantages.product2.push({
          category,
          description: `Mejor ${category}`,
          details: fullSpec2.advantages
        });
      }
    }

    // Comparar precio total del producto
    if (product1.basePrice && product2.basePrice) {
      const priceDiff = ((product2.basePrice - product1.basePrice) / product1.basePrice) * 100;
      if (Math.abs(priceDiff) > 10) { // Solo considerar diferencias mayores al 10%
        if (priceDiff > 0) {
          comparison.advantages.product1.push({
            category: 'price',
            description: 'Mejor precio',
            difference: `${Math.round(Math.abs(priceDiff))}% más económico`
          });
        } else {
          comparison.advantages.product2.push({
            category: 'price',
            description: 'Mejor precio',
            difference: `${Math.round(Math.abs(priceDiff))}% más económico`
          });
        }
      }
    }

    // Determinar ganador basado en ventajas
    const score1 = comparison.advantages.product1.length;
    const score2 = comparison.advantages.product2.length;
    
    if (score1 > score2) {
      comparison.winner = 'product1';
    } else if (score2 > score1) {
      comparison.winner = 'product2';
    }

    return comparison;
  },

  // Comparar especificaciones específicas
  compareSpecs(spec1, spec2) {
    const differences = {
      specs: {},
      description: []
    };

    // Comparar cada propiedad en specs
    for (const key in spec1.specs) {
      if (typeof spec1.specs[key] === 'number' && typeof spec2.specs[key] === 'number') {
        const diff = ((spec2.specs[key] - spec1.specs[key]) / spec1.specs[key]) * 100;
        if (Math.abs(diff) > 10) { // Solo mostrar diferencias significativas
          differences.specs[key] = {
            value1: spec1.specs[key],
            value2: spec2.specs[key],
            percentDiff: diff
          };
        }
      }
    }

    // Agregar descripciones comparativas
    for (const key in spec1.description) {
      if (spec2.description[key] && spec1.description[key] !== spec2.description[key]) {
        differences.description.push({
          aspect: key,
          spec1: spec1.description[key],
          spec2: spec2.description[key]
        });
      }
    }

    return differences;
  },

  // Encontrar alternativas basadas en ranking
  findAlternatives(product, maxRankingDiff = 2) {
    const alternatives = [];
    const type = product.category.toLowerCase();

    for (const category in product.specs) {
      const currentSpec = product.specs[category];
      const categorySpecs = specifications[category]?.[type];
      
      if (!categorySpecs || !currentSpec) continue;

      const currentSpecFull = categorySpecs.find(s => s.id === currentSpec.id);
      if (!currentSpecFull) continue;

      const possibleAlternatives = categorySpecs.filter(spec => {
        // No incluir el mismo componente
        if (spec.id === currentSpec.id) return false;

        // Verificar diferencia de ranking
        const rankingDiff = Math.abs(spec.ranking - currentSpecFull.ranking);
        return rankingDiff <= maxRankingDiff;
      });

      if (possibleAlternatives.length > 0) {
        alternatives.push({
          category,
          currentSpec: currentSpecFull,
          alternatives: possibleAlternatives.sort((a, b) => a.ranking - b.ranking)
        });
      }
    }

    return alternatives;
  },

  // Calcular la diferencia de ranking entre dos componentes
  getRankingDifference(spec1, spec2) {
    if (!spec1.ranking || !spec2.ranking) return 0;
    return Math.abs(spec1.ranking.overall - spec2.ranking.overall);
  },

  // Calcular la diferencia de precio relativa
  getPriceRatio(price1, price2) {
    const higher = Math.max(price1, price2);
    const lower = Math.min(price1, price2);
    return (higher - lower) / lower;
  },

  // Encontrar alternativas por precio
  findPriceAlternatives(product, maxRankingDiff = 3, maxPriceRatio = 0.3) {
    const alternatives = [];
    const type = product.category.toLowerCase();

    for (const category in product.specs) {
      const currentSpec = product.specs[category];
      const categorySpecs = specifications[category]?.[type];
      
      if (!categorySpecs || !currentSpec) continue;

      const currentSpecFull = categorySpecs.find(s => s.id === currentSpec.id);
      if (!currentSpecFull) continue;

      const possibleAlternatives = categorySpecs.filter(spec => {
        // No incluir el mismo componente
        if (spec.id === currentSpec.id) return false;

        // Verificar diferencia de ranking
        const rankingDiff = this.getRankingDifference(currentSpecFull, spec);
        if (rankingDiff > maxRankingDiff) return false;

        // Verificar diferencia de precio
        const priceRatio = this.getPriceRatio(currentSpecFull.referencePrice, spec.referencePrice);
        if (priceRatio > maxPriceRatio) return false;

        // Solo incluir alternativas más baratas
        return spec.referencePrice < currentSpecFull.referencePrice;
      });

      alternatives.push({
        category,
        currentSpec: currentSpecFull,
        alternatives: possibleAlternatives
      });
    }

    return alternatives;
  },

  // Encontrar alternativas por rendimiento
  findPerformanceAlternatives(product, maxPriceRatio = 0.3, minPerformanceGain = 0.1) {
    const alternatives = [];
    const type = product.category.toLowerCase();

    for (const category in product.specs) {
      const currentSpec = product.specs[category];
      const categorySpecs = specifications[category]?.[type];
      
      if (!categorySpecs || !currentSpec) continue;

      const currentSpecFull = categorySpecs.find(s => s.id === currentSpec.id);
      if (!currentSpecFull) continue;

      const possibleAlternatives = categorySpecs.filter(spec => {
        // No incluir el mismo componente
        if (spec.id === currentSpec.id) return false;

        // Verificar ganancia de rendimiento
        const performanceGain = (spec.performanceScore - currentSpecFull.performanceScore) / currentSpecFull.performanceScore;
        if (performanceGain < minPerformanceGain) return false;

        // Verificar diferencia de precio
        const priceRatio = this.getPriceRatio(currentSpecFull.referencePrice, spec.referencePrice);
        return priceRatio <= maxPriceRatio;
      });

      alternatives.push({
        category,
        currentSpec: currentSpecFull,
        alternatives: possibleAlternatives
      });
    }

    return alternatives;
  },

  // Analizar ventajas entre especificaciones
  analyzeAdvantages(comparison, category, spec1, spec2) {
    // Comparar rendimiento general
    if (spec1.performanceScore > spec2.performanceScore) {
      comparison.advantages.product1.push({
        category,
        description: `Mejor rendimiento en ${category}`,
        difference: `${Math.round((spec1.performanceScore - spec2.performanceScore))}% superior`
      });
    } else if (spec2.performanceScore > spec1.performanceScore) {
      comparison.advantages.product2.push({
        category,
        description: `Mejor rendimiento en ${category}`,
        difference: `${Math.round((spec2.performanceScore - spec1.performanceScore))}% superior`
      });
    }

    // Comparar rankings específicos
    if (spec1.ranking && spec2.ranking) {
      for (const aspect in spec1.ranking) {
        if (spec1.ranking[aspect] < spec2.ranking[aspect]) { // Menor ranking es mejor
          comparison.advantages.product1.push({
            category,
            description: `Mejor ${aspect} en ${category}`,
            difference: `Ranking ${spec1.ranking[aspect]} vs ${spec2.ranking[aspect]}`
          });
        } else if (spec2.ranking[aspect] < spec1.ranking[aspect]) {
          comparison.advantages.product2.push({
            category,
            description: `Mejor ${aspect} en ${category}`,
            difference: `Ranking ${spec2.ranking[aspect]} vs ${spec1.ranking[aspect]}`
          });
        }
      }
    }

    // Comparar especificaciones técnicas específicas
    for (const key in spec1.specs) {
      if (typeof spec1.specs[key] === 'number' && typeof spec2.specs[key] === 'number') {
        const diff = ((spec2.specs[key] - spec1.specs[key]) / spec1.specs[key]) * 100;
        if (Math.abs(diff) > 10) { // Solo considerar diferencias mayores al 10%
          const advantage = {
            category,
            description: `${key} superior`,
            difference: `${Math.abs(Math.round(diff))}% de diferencia`
          };
          
          if (diff > 0) {
            comparison.advantages.product2.push(advantage);
          } else {
            comparison.advantages.product1.push(advantage);
          }
        }
      }
    }
  }
}; 