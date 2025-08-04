import axios from 'axios';

// API base URL - connected to backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5217/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products?${queryString}`);
  },
  
  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },

  // Cart
  getCart: (userId) => {
    return api.get(`/cart/${userId}`);
  },

  addToCart: (data) => {
    return api.post('/cart/add', data);
  },

  updateCartItem: (itemId, data) => {
    return api.put(`/cart/${itemId}`, data);
  },

  removeFromCart: (itemId) => {
    return api.delete(`/cart/${itemId}`);
  },

  clearCart: (userId) => {
    return api.delete(`/cart/clear/${userId}`);
  },

  // Orders
  createOrder: (data) => {
    return api.post('/orders', data);
  },

  getOrders: (userId) => {
    return api.get(`/orders/${userId}`);
  },

  getOrder: (orderId) => {
    return api.get(`/orders/details/${orderId}`);
  },
};

export default api;