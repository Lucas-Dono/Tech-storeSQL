import { API_URL, ENDPOINTS } from '../config/api';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'Error en la solicitud');
    error.response = data;
    throw error;
  }
  
  return data;
};

export const authService = {
  async login(credentials) {
    try {
      console.log('Preparando solicitud de login:', {
        url: `${API_URL}${ENDPOINTS.LOGIN}`,
        email: credentials.email,
        tienePassword: !!credentials.password,
        longitudPassword: credentials.password ? credentials.password.length : 0
      });

      const requestBody = {
        email: credentials.email,
        password: credentials.password
      };

      console.log('Body de la solicitud:', {
        ...requestBody,
        password: '[PROTECTED]'
      });

      const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        data: data.message ? { message: data.message } : 'Respuesta exitosa'
      });
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error detallado en login:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('Enviando solicitud de registro a:', `${API_URL}${ENDPOINTS.REGISTER}`);
      const response = await fetch(`${API_URL}${ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error detallado en registro:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.PROFILE}`, {
        headers: getHeaders(token)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Obteniendo usuarios con token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS}`, {
        headers: getHeaders(token)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener usuarios');
      }

      return await response.json();
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

      const response = await fetch(`${API_URL}${ENDPOINTS.USER_STATUS}`, {
        method: 'POST',
        headers: getHeaders(token),
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

  async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.USER_DELETE(userId)}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }
}; 