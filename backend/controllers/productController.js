const Product = require('../models/Product');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'name email role');
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email role');
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
      ...req.body,
      video: req.body.video || null,
      createdBy: req.user.id,
      // Asegurar que los campos de traducción estén presentes
      name_es: req.body.name,
      name_en: req.body.name_en || req.body.name,
      description_es: req.body.description,
      description_en: req.body.description_en || req.body.description
    };

    // Eliminar campos que no deben estar en el modelo
    delete productData.id;
    delete productData._id;

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario es el creador o un admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No autorizado para actualizar este producto' });
    }

    // Asegurarse de que el video sea null si no se proporciona
    const updateData = {
      ...req.body,
      video: req.body.video || null,
      // Asegurar que los campos de traducción estén presentes
      name_es: req.body.name,
      name_en: req.body.name_en || req.body.name,
      description_es: req.body.description,
      description_en: req.body.description_en || req.body.description
    };

    // Eliminar campos que no deben estar en el modelo
    delete updateData.id;
    delete updateData._id;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario es el creador o un admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No autorizado para eliminar este producto' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
}; 