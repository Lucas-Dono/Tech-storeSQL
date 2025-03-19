import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  validatePassword,
  generateSessionToken,
  validateSessionToken,
  sanitizeInput,
  validateEmail,
  generateSalt,
  hashPasswordWithSalt
} from '../utils/security';

const AuthContext = createContext();

// Función para verificar si un usuario es admin de forma segura
const isUserAdmin = (user) => {
  return user?.isAdmin === true && user?.email === import.meta.env.VITE_ADMIN_EMAIL;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        // Verificar si el admin existe y tiene el formato correcto
        const adminExists = parsedUsers.some(user => 
          user.email === import.meta.env.VITE_ADMIN_EMAIL && 
          user.salt && 
          user.password
        );
        
        if (!adminExists) {
          // Crear admin si no existe
          const adminSalt = generateSalt();
          const adminUser = {
            email: import.meta.env.VITE_ADMIN_EMAIL,
            salt: adminSalt,
            password: hashPasswordWithSalt(import.meta.env.VITE_ADMIN_PASSWORD, adminSalt),
            name: 'Admin',
            birthDate: '1990-01-01',
            isAdmin: true
          };
          return [...parsedUsers, adminUser];
        }
        return parsedUsers;
      }
      return [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  });

  // Cargar sesión guardada
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('sessionToken');
      if (savedToken) {
        const { isValid, userId } = validateSessionToken(savedToken);
        if (isValid) {
          const user = users.find(u => u.email === userId);
          if (user) {
            // Verificar si el usuario es admin de forma segura
            const userWithAdminStatus = {
              ...user,
              isAdmin: isUserAdmin(user)
            };
            setCurrentUser(userWithAdminStatus);
            setSessionToken(savedToken);
          }
        } else {
          localStorage.removeItem('sessionToken');
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [users]);

  // Guardar usuarios en localStorage cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }, [users]);

  const login = async (email, password) => {
    try {
      // Sanitizar inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      // Validar email
      if (!validateEmail(sanitizedEmail)) {
        return { success: false, error: 'Email inválido' };
      }

      const user = users.find(u => u.email === sanitizedEmail);
      if (!user) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      if (!user.salt) {
        console.error('User has no salt:', user.email);
        return { success: false, error: 'Error en la configuración de la cuenta' };
      }

      // Verificar contraseña usando el salt del usuario
      const hashedAttempt = hashPasswordWithSalt(sanitizedPassword, user.salt);
      if (hashedAttempt === user.password) {
        const token = generateSessionToken(user.email);
        // Verificar si el usuario es admin de forma segura
        const userWithAdminStatus = {
          ...user,
          isAdmin: isUserAdmin(user)
        };
        setCurrentUser(userWithAdminStatus);
        setSessionToken(token);
        localStorage.setItem('sessionToken', token);
        return { success: true };
      }

      return { success: false, error: 'Credenciales inválidas' };
    } catch (error) {
      console.error('Error in login:', error);
      return { success: false, error: 'Error al intentar iniciar sesión' };
    }
  };

  const logout = () => {
    try {
      setCurrentUser(null);
      setSessionToken(null);
      localStorage.removeItem('sessionToken');
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };

  const register = async (newUser) => {
    try {
      // Sanitizar inputs
      const sanitizedData = {
        ...newUser,
        email: sanitizeInput(newUser.email),
        name: sanitizeInput(newUser.name),
        password: sanitizeInput(newUser.password)
      };

      // Validar email
      if (!validateEmail(sanitizedData.email)) {
        return { success: false, error: 'Email inválido' };
      }

      // Verificar si el email ya existe
      if (users.some(user => user.email === sanitizedData.email)) {
        return { success: false, error: 'El email ya está registrado' };
      }

      // Validar fortaleza de la contraseña
      const passwordValidation = validatePassword(sanitizedData.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] };
      }

      // Generar salt y hashear contraseña
      const salt = generateSalt();
      const hashedPassword = hashPasswordWithSalt(sanitizedData.password, salt);

      // Agregar nuevo usuario
      const userToAdd = {
        ...sanitizedData,
        password: hashedPassword,
        salt,
        isAdmin: false
      };
      
      setUsers(prevUsers => [...prevUsers, userToAdd]);
      return { success: true };
    } catch (error) {
      console.error('Error in register:', error);
      return { success: false, error: 'Error al intentar registrar el usuario' };
    }
  };

  const value = {
    currentUser,
    users,
    login,
    logout,
    register,
    sessionToken
  };

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
