import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

// Simular un delay para emular una llamada a API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  // Obtener todos los productos
  async getProducts() {
    try {
      const baseUrl = API_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}${ENDPOINTS.PRODUCTS}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener productos');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getProducts:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  async getProductById(id) {
    try {
      if (!id) {
        throw new Error('ID de producto no proporcionado');
      }
      const baseUrl = API_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}${ENDPOINTS.PRODUCT_BY_ID(id)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener producto');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  async createProduct(newProduct, token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }
      if (!newProduct) {
        throw new Error('Datos del producto no proporcionados');
      }

      const baseUrl = API_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}${ENDPOINTS.PRODUCTS}`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(newProduct),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear producto');
      }
      
      const createdProduct = await response.json();
      return createdProduct;
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  },

  // Actualizar un producto
  async updateProduct(id, updatedData, token) {
    try {
      if (!id) {
        throw new Error('ID de producto no proporcionado');
      }
      if (!token) {
        throw new Error('Token no proporcionado');
      }
      if (!updatedData) {
        throw new Error('Datos de actualización no proporcionados');
      }

      const baseUrl = API_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}${ENDPOINTS.PRODUCT_BY_ID(id)}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar producto');
      }
      
      const updatedProduct = await response.json();
      return updatedProduct;
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(id, token) {
    try {
      if (!id) {
        throw new Error('ID de producto no proporcionado');
      }
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const baseUrl = API_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}${ENDPOINTS.PRODUCT_BY_ID(id)}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar producto');
      }
      
      return id;
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }
}; 