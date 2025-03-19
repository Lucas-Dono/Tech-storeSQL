import CryptoJS from 'crypto-js';

// Clave secreta para encriptación (en producción debería estar en variables de entorno)
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'your-secret-key-2024';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';

// Encriptar contraseña
export const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

// Desencriptar contraseña
export const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Validar fortaleza de contraseña
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generar salt aleatorio
export const generateSalt = () => {
  const randomBytes = CryptoJS.lib.WordArray.random(16);
  return randomBytes.toString(CryptoJS.enc.Base64);
};

// Hashear contraseña con salt
export const hashPasswordWithSalt = (password, salt) => {
  try {
    if (!password || !salt) {
      console.error('Password or salt is missing:', { password: !!password, salt: !!salt });
      throw new Error('Password and salt are required');
    }

    // Usar PBKDF2 para un hashing más seguro
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 1000
    });

    return key.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

// Generar token de sesión
export const generateSessionToken = (userId) => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  return CryptoJS.AES.encrypt(JSON.stringify(payload), JWT_SECRET).toString();
};

// Validar token de sesión
export const validateSessionToken = (token) => {
  if (!token) return { isValid: false };
  
  try {
    const bytes = CryptoJS.AES.decrypt(token, JWT_SECRET);
    const payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    // Verificar expiración
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { isValid: false };
    }
    
    return { isValid: true, userId: payload.userId };
  } catch (error) {
    console.error('Error validating session token:', error);
    return { isValid: false };
  }
};

// Sanitizar input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Eliminar caracteres especiales y HTML tags
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
};

// Validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 