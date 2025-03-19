import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

// Simular un delay para emular una llamada a API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  // Obtener todos los productos
  async getProducts() {
    const response = await fetch(`${API_URL}${ENDPOINTS.PRODUCTS}`);
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    return response.json();
  },

  // Obtener un producto por ID
  async getProductById(id) {
    const response = await fetch(`${API_URL}${ENDPOINTS.PRODUCT_BY_ID(id)}`);
    if (!response.ok) {
      throw new Error('Error al obtener producto');
    }
    return response.json();
  },

  // Crear un nuevo producto
  async createProduct(newProduct, token) {
    const response = await fetch(`${API_URL}${ENDPOINTS.PRODUCTS}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(newProduct),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear producto');
    }
    
    return response.json();
  },

  // Actualizar un producto
  async updateProduct(id, updatedData, token) {
    const response = await fetch(`${API_URL}${ENDPOINTS.PRODUCT_BY_ID(id)}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar producto');
    }
    
    return response.json();
  },

  // Eliminar un producto
  async deleteProduct(id, token) {
    const response = await fetch(`${API_URL}${ENDPOINTS.PRODUCT_BY_ID(id)}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar producto');
    }
    
    return id;
  }
}; 