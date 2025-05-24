// API Configuration
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:10000';
  // Eliminar cualquier trailing slash
  return envUrl.replace(/\/$/, '');
};

export const API_URL = getBaseUrl();
export const API_TIMEOUT = 30000; // 30 seconds

// Headers Configuration
export const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// API Endpoints
export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGIN_GOOGLE: '/api/auth/google-login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/me',
  USERS: '/api/auth/users',
  USER_STATUS: '/api/auth/users/toggle-status',
  USER_DELETE: (userId) => `/api/auth/users/${userId}`,
  CATEGORIES: '/api/categories',
  UPLOAD: '/api/upload',
  
  // Users Management
  USER_ROLE: '/api/auth/users/update-role',
  
  // Products
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Media
  UPLOAD_IMAGES: '/api/upload/multiple',
  UPLOAD_VIDEO: '/api/upload/video',
  DELETE_MEDIA: '/api/upload'
}; 