const API_URL = 'http://localhost:3001/api';

// Simular un delay para emular una llamada a API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  // Obtener todos los productos
  async getProducts() {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    return response.json();
  },

  // Obtener un producto por ID
  async getProductById(id) {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener producto');
    }
    return response.json();
  },

  // Crear un nuevo producto
  async createProduct(newProduct) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear producto');
    }
    
    return response.json();
  },

  // Actualizar un producto
  async updateProduct(id, updatedData) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }
    
    return response.json();
  },

  // Eliminar un producto
  async deleteProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }
    
    return id;
  }
}; 