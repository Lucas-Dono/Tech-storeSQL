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

    // Lógica simple de similitud (puedes mejorarla)
    const productsWithScore = comparableProducts.map(product => {
      let score = 0;
      if (product.category === baseProduct.category) score += 1;
      if (Math.abs(product.basePrice - baseProduct.basePrice) < baseProduct.basePrice * 0.15) score += 1;
      // Puedes agregar más criterios aquí
      return { ...product, similarityScore: score };
    });

    // Ordenar por similitud
    productsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json(productsWithScore);
  } catch (error) {
    console.error('Error al comparar productos:', error);
    res.status(500).json({ message: 'Error al comparar productos' });
  }
}; 