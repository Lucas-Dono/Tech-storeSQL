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
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/me',
  USERS: '/api/auth/users',
  USER_STATUS: '/api/auth/users/toggle-status',
  USER_DELETE: (userId) => `/api/auth/users/${userId}`,
  PRODUCTS: '/api/products',
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