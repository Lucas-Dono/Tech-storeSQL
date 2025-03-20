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
    const loadUserProfile = async () => {
      try {
        console.log('Cargando perfil de usuario:', token ? 'Token presente' : 'Sin token');
        
        if (token) {
          const userData = await authService.getProfile(token);
          console.log('Usuario cargado:', {
            role: userData.role,
            email: userData.email,
            isAdmin: userData.role === ROLES.ADMIN,
            isSuperAdmin: userData.role === ROLES.SUPERADMIN
          });
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setCurrentUser(response);
        return { success: true };
      }
      return { success: false, error: 'Error en las credenciales' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, user: response };
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, error: error.message };
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
