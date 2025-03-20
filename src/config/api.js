// API Configuration
export const API_URL = 'https://tech-store-backend-54ph.onrender.com';
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
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/me',
  
  // Users Management
  USERS: '/api/auth/users',
  USER_ROLE: (userId) => `/api/auth/users/${userId}/role`,
  USER_STATUS: (userId) => `/api/auth/users/${userId}/status`,
  USER_DELETE: (userId) => `/api/auth/users/${userId}`,
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Categories
  CATEGORIES: '/api/categories',
  
  // Media
  UPLOAD_IMAGES: '/api/upload/multiple',
  UPLOAD_VIDEO: '/api/upload/video',
  DELETE_MEDIA: '/api/upload'
}; 