import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Funciones de utilidad para roles
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
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
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
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
  const isSuperAdmin = () => {
    const result = currentUser?.role === ROLES.SUPERADMIN;
    console.log('isSuperAdmin:', {
      currentUserRole: currentUser?.role,
      result
    });
    return result;
  };
  
  const isAdmin = () => {
    const result = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.SUPERADMIN;
    console.log('isAdmin:', {
      currentUserRole: currentUser?.role,
      result
    });
    return result;
  };
  
  const isUser = () => {
    const result = !!currentUser;
    console.log('isUser:', {
      currentUser: currentUser ? 'Presente' : 'Ausente',
      result
    });
    return result;
  };

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
    token: localStorage.getItem('token'),
    getToken: () => {
      const token = localStorage.getItem('token');
      console.log('Obteniendo token:', token ? 'Presente' : 'Ausente');
      return token;
    }
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
