const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    // Asegurarse de que el video sea null si no se proporciona
    const productData = {
      name: req.body.name,
      name_es: req.body.name,
      name_en: req.body.name_en || req.body.name,
      description: req.body.description,
      description_es: req.body.description,
      description_en: req.body.description_en || req.body.description,
      basePrice: parseFloat(req.body.basePrice),
      images: req.body.images || [],
      category: req.body.category,
      stock: parseInt(req.body.stock),
      variantType: req.body.variantType || 'SIMPLE',
      features: req.body.features || {},
      models: req.body.models || null,
      defaultConfiguration: req.body.defaultConfiguration || {},
      video: req.body.video || null,
      createdById: req.user.id
    };

    const product = await prisma.product.create({
      data: productData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ya existe un producto con esos datos' });
    }
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    console.log('Datos recibidos para actualizar:', req.body);
    
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        createdBy: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario es el creador o un admin
    if (product.createdBy.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No autorizado para actualizar este producto' });
    }

    // Preparar datos para la actualización
    const updateData = {
      name: req.body.name,
      name_es: req.body.name,
      name_en: req.body.name_en || req.body.name,
      description: req.body.description,
      description_es: req.body.description,
      description_en: req.body.description_en || req.body.description,
      basePrice: parseFloat(req.body.basePrice),
      images: req.body.images !== undefined ? req.body.images : product.images,
      category: req.body.category,
      stock: parseInt(req.body.stock),
      variantType: req.body.variantType || product.variantType,
      features: req.body.features || {},
      models: req.body.models || product.models,
      defaultConfiguration: req.body.defaultConfiguration || {},
      video: req.body.video || null
    };

    console.log('Datos procesados para actualizar:', updateData);

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log('Producto actualizado:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ya existe un producto con esos datos' });
    }
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        createdBy: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario es el creador o un admin
    if (product.createdBy.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No autorizado para eliminar este producto' });
    }

    await prisma.product.delete({
      where: {
        id: productId
      }
    });
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

// Comparar productos y devolver productos similares
exports.getComparableProducts = async (req, res) => {
  try {
    console.log('Query recibida:', req.query);
    const productId = parseInt(req.query.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    // Obtener el producto base
    const baseProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, features: true }
    });
    if (!baseProduct) {
      return res.status(404).json({ message: 'Producto base no encontrado' });
    }

    // Definir rango de precio
    const PRICE_RANGES = { min: 0.7, max: 1.3 };
    const priceRange = {
      min: baseProduct.basePrice * PRICE_RANGES.min,
      max: baseProduct.basePrice * PRICE_RANGES.max
    };

    // Buscar productos comparables
    const comparableProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        category: baseProduct.category,
        basePrice: { gte: priceRange.min, lte: priceRange.max }
      },
      include: { category: true, features: true },
      take: 10
    });

    // Criterios de comparación por categoría
    const categoryCriteria = {
      laptop: ['processor', 'ram', 'storage', 'graphics', 'screen', 'battery', 'security', 'sound'],
      smartphone: ['processor', 'ram', 'storage', 'camera', 'battery', 'security', 'sound', 'connectivity'],
      tablet: ['processor', 'ram', 'storage', 'screen', 'battery', 'connectivity', 'sound'],
      default: ['processor', 'ram', 'storage', 'battery']
    };
    const categoryKey = (baseProduct.category?.toLowerCase() || 'default');
    const criteria = categoryCriteria[categoryKey] || categoryCriteria.default;

    // Helper para extraer valor de feature
    function getFeatureValue(product, key) {
      return product.features && product.features[key] && product.features[key].selectedComponent
        ? product.features[key].selectedComponent.name || product.features[key].selectedComponent.value
        : null;
    }

    // Comparar productos y generar ventajas
    const productsWithAdvantages = comparableProducts.map(product => {
      let advantages = [];
      // Comparar precio
      if (product.basePrice < baseProduct.basePrice) {
        const diff = Math.round(((baseProduct.basePrice - product.basePrice) / baseProduct.basePrice) * 100);
        advantages.push(`Más barato (${diff}% menos)`);
      } else if (product.basePrice > baseProduct.basePrice) {
        const diff = Math.round(((product.basePrice - baseProduct.basePrice) / baseProduct.basePrice) * 100);
        advantages.push(`Más caro (${diff}% más)`);
      }
      // Comparar features clave
      criteria.forEach(key => {
        const baseValue = getFeatureValue(baseProduct, key);
        const compValue = getFeatureValue(product, key);
        if (baseValue && compValue && baseValue !== compValue) {
          // Ejemplo: RAM: 8GB vs 16GB
          if (key === 'ram' || key === 'storage' || key === 'battery') {
            // Extraer número
            const baseNum = parseInt(baseValue);
            const compNum = parseInt(compValue);
            if (!isNaN(baseNum) && !isNaN(compNum)) {
              if (compNum > baseNum) {
                advantages.push(`Más ${key === 'ram' ? 'RAM' : key === 'storage' ? 'almacenamiento' : 'batería'} (${compValue})`);
              } else if (compNum < baseNum) {
                advantages.push(`Menos ${key === 'ram' ? 'RAM' : key === 'storage' ? 'almacenamiento' : 'batería'} (${compValue})`);
              }
            }
          } else if (key === 'camera' || key === 'screen' || key === 'graphics' || key === 'sound' || key === 'security' || key === 'connectivity' || key === 'processor') {
            // Para otros features, solo mostrar si es diferente
            advantages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${compValue}`);
          }
        }
      });
      return {
        ...product,
        advantages
      };
    });

    // Ordenar por cantidad de ventajas (más relevante primero)
    productsWithAdvantages.sort((a, b) => b.advantages.length - a.advantages.length);

    res.json(productsWithAdvantages);
  } catch (error) {
    console.error('Error al comparar productos:', error);
    res.status(500).json({ message: 'Error al comparar productos' });
  }
}; 