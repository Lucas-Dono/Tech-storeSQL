const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  name_es: {
    type: String,
    required: [true, 'El nombre en español es requerido'],
    trim: true
  },
  name_en: {
    type: String,
    required: [true, 'El nombre en inglés es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida']
  },
  description_es: {
    type: String,
    required: [true, 'La descripción en español es requerida']
  },
  description_en: {
    type: String,
    required: [true, 'La descripción en inglés es requerida']
  },
  basePrice: {
    type: Number,
    required: [true, 'El precio base es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  images: [{
    type: String,
    required: [true, 'Al menos una imagen es requerida']
  }],
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['Laptops', 'Smartphones', 'Tablets', 'Accessories']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo']
  },
  variantType: {
    type: String,
    enum: ['SIMPLE', 'CONFIGURABLE'],
    default: 'SIMPLE'
  },
  features: {
    type: Object,
    default: {}
  },
  models: [{
    name: String,
    images: [String],
    price: Number,
    stock: Number,
    specifications: Object
  }],
  defaultConfiguration: {
    type: Object,
    default: {}
  },
  video: {
    url: String,
    type: {
      type: String,
      enum: ['url', 'file']
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 