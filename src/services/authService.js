import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

export const authService = {
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el inicio de sesión');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el registro');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  },

  async getProfile(token) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: getHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener el perfil');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },
}; 