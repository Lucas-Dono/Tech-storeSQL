import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Funciones de utilidad para roles
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Si hay un token en localStorage, intentamos recuperar la información del usuario
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', { email });
      const response = await authService.login({ email, password });
      console.log('Respuesta del login:', { ...response, token: response.token ? '[TOKEN]' : null });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        setToken(response.token);
        setCurrentUser(response);
        return { success: true };
      }
      return { success: false, error: 'Error en las credenciales' };
    } catch (error) {
      console.error('Error detallado en login:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      console.log('Intentando login con Google');
      const response = await authService.loginWithGoogle(credentialResponse);
      console.log('Respuesta del login con Google:', { ...response, token: response.token ? '[TOKEN]' : null });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        setToken(response.token);
        setCurrentUser(response);
        return { success: true };
      }
      return { success: false, error: 'Error en la autenticación con Google' };
    } catch (error) {
      console.error('Error detallado en login con Google:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión con Google';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      console.log('Intentando registro con:', { ...userData, password: '[PROTECTED]' });
      const response = await authService.register(userData);
      console.log('Respuesta del registro:', response);
      
      // Si el registro fue exitoso, guardamos el token y los datos del usuario
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        setToken(response.token);
        setCurrentUser(response);
        return { success: true, user: response };
      }
      
      return { success: false, error: 'Error al crear la cuenta' };
    } catch (error) {
      console.error('Error detallado en registro:', error);
      return { 
        success: false, 
        error: error.response?.message || error.message || 'Error al crear la cuenta'
      };
    }
  };

  // Funciones de verificación de roles
  const isSuperAdmin = currentUser?.role === ROLES.SUPERADMIN;
  const isAdmin = currentUser?.role === ROLES.ADMIN || isSuperAdmin;
  const isUser = !!currentUser;

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    isSuperAdmin,
    isAdmin,
    isUser,
    ROLES,
    token,
    getToken: () => token
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
