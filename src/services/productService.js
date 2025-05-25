import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 segundos

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
      console.log(`Reintentando petición... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, MAX_RETRIES - retries) * 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export const productService = {
  // Obtener todos los productos
  async getProducts() {
    try {
      return await fetchWithRetry(`${API_URL}${ENDPOINTS.PRODUCTS}`);
    } catch (error) {
      console.error('Error en getProducts:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  async getProductById(id) {
    try {
      return await fetchWithRetry(`${API_URL}${ENDPOINTS.PRODUCTS}/${id}`);
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  async createProduct(productData, token) {
    try {
      return await fetchWithRetry(`${API_URL}${ENDPOINTS.PRODUCTS}`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(productData)
      });
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  },

  // Actualizar un producto
  async updateProduct(id, productData, token) {
    try {
      return await fetchWithRetry(`${API_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(productData)
      });
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(id, token) {
    try {
      return await fetchWithRetry(`${API_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }
}; 