// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://tech-store-backend-54ph.onrender.com';
export const API_TIMEOUT = 30000; // 30 seconds

// Headers Configuration
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  
  // Users Management
  USERS: '/auth/users',
  USER_ROLE: (id) => `/auth/users/${id}/role`,
  USER_STATUS: (id) => `/auth/users/${id}/status`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  
  // Media
  UPLOAD_IMAGES: '/upload/multiple',
  UPLOAD_VIDEO: '/upload/video',
  DELETE_MEDIA: '/upload',
}; 