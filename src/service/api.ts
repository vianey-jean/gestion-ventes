
import axios from 'axios';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, Product, RegistrationData, Sale, User } from "../types";

// API base URL
const API_URL = 'https://server-gestion-ventes.onrender.com/api';

// Create axios instance with increased timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000  // Increase timeout to 10 seconds (from default 0)
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User authentication service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },
  
  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data.exists;
    } catch (error) {
      console.error("Check email error:", error);
      return false;
    }
  },
  
  register: async (data: RegistrationData): Promise<User | null> => {
    try {
      const response = await api.post('/auth/register', data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error("Register error:", error);
      return null;
    }
  },
  
  resetPasswordRequest: async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      const response = await api.post('/auth/reset-password-request', data);
      return response.data.success;
    } catch (error) {
      console.error("Reset password request error:", error);
      return false;
    }
  },
  
  resetPassword: async (data: PasswordResetData): Promise<boolean> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data.success;
    } catch (error) {
      console.error("Reset password error:", error);
      return false;
    }
  },
  
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },
  
  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }
};

// Product service
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error("Get products error:", error);
      return [];
    }
  },
  
  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await api.post('/products', product);
      return response.data;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },
  
  updateProduct: async (product: Product): Promise<Product> => {
    try {
      const response = await api.put(`/products/${product.id}`, product);
      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get product by ID error:", error);
      return null;
    }
  },
  
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      if (!query || query.length < 3) return [];
      
      const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Search products error:", error);
      return [];
    }
  }
};

// Sales service
export const salesService = {
  getSales: async (month?: number, year?: number): Promise<Sale[]> => {
    try {
      let url = '/sales';
      
      if (month !== undefined && year !== undefined) {
        url = `/sales/by-month?month=${month}&year=${year}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get sales error:", error);
      return [];
    }
  },
  
  addSale: async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
    try {
      const response = await api.post('/sales', sale);
      return response.data;
    } catch (error) {
      console.error("Add sale error:", error);
      throw error;
    }
  },
  
  updateSale: async (sale: Sale): Promise<Sale> => {
    try {
      const response = await api.put(`/sales/${sale.id}`, sale);
      return response.data;
    } catch (error) {
      console.error("Update sale error:", error);
      throw error;
    }
  },
  
  deleteSale: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/sales/${id}`);
      return true;
    } catch (error) {
      console.error("Delete sale error:", error);
      return false;
    }
  },
  
  exportSalesToPdf: async (month: number, year: number): Promise<boolean> => {
    try {
      const response = await api.post('/sales/export-month', { month, year });
      return response.data.success;
    } catch (error) {
      console.error("Export sales error:", error);
      return false;
    }
  }
};
