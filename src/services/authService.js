import { API_URL, ENDPOINTS, getHeaders } from '../config/api';

export const authService = {
  async login(credentials) {
    try {
      console.log('Intentando login con:', credentials.email);
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
      console.log('Login exitoso:', {
        token: data.token ? 'Presente' : 'Ausente',
        role: data.role,
        email: data.email
      });
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
      console.log('Obteniendo perfil con token:', token ? 'Presente' : 'Ausente');
      const response = await fetch(`${API_URL}${ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: getHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener el perfil');
      }

      const data = await response.json();
      console.log('Perfil obtenido:', {
        role: data.role,
        email: data.email,
        id: data._id
      });
      return data;
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },

  // Funciones para gestión de usuarios
  async getAllUsers(token) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS}`, {
        method: 'GET',
        headers: getHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener usuarios');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw error;
    }
  },

  async updateUserRole(userId, newRole, token) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USER_ROLE(userId)}`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar rol');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en updateUserRole:', error);
      throw error;
    }
  },

  async toggleUserStatus(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/api/auth/users/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar el estado del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en toggleUserStatus:', error);
      throw error;
    }
  },

  async deleteUser(userId, token) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USER_DELETE(userId)}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }
}; 