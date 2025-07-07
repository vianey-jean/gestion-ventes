
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Product, Sale, User, LoginCredentials, RegisterCredentials, PretFamille, PretProduit, DepenseFixe, DepenseDuMois } from '@/types';

// Configuration de l'URL de base
const getBaseURL = () => {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return import.meta.env.VITE_API_URL || 'https://server-gestion-ventes.onrender.com';
  }
  
  // En production, utiliser l'URL du serveur déployé
  return import.meta.env.VITE_API_URL || 'https://server-gestion-ventes.onrender.com';
};

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Configure retry logic
  axiosRetry(instance, {
    retries: 3,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             (error.response?.status === 503);
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

// Auth API
export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/api/auth/login', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/api/auth/register', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response: AxiosResponse<{ exists: boolean }> = await api.post('/api/auth/check-email', { email });
    return response.data;
  },

  async resetPassword(email: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> = await api.post('/api/auth/reset-password', { email });
    return response.data;
  },

  async verifyToken(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await api.get('/api/auth/verify');
    return response.data;
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  resetPasswordRequest: async (data: { email: string }): Promise<boolean> => {
    try {
      const response = await api.post('/api/auth/reset-password-request', data);
      return response.data.exists;
    } catch (error) {
      return false;
    }
  },
};

// Products API
export const productService = {
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await api.get('/api/products');
    return response.data;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response: AxiosResponse<Product> = await api.post('/api/products', product);
    return response.data;
  },

  async updateProduct(product: Product): Promise<Product> {
    const response: AxiosResponse<Product> = await api.put(`/api/products/${product.id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await api.delete(`/api/products/${id}`);
    return true;
  },
};

// Sales API
export const salesService = {
  async getSales(month?: number, year?: number): Promise<Sale[]> {
    let url = '/api/sales';
    if (month !== undefined && year !== undefined) {
      url += `/by-month?month=${month}&year=${year}`;
    }
    const response: AxiosResponse<Sale[]> = await api.get(url);
    return response.data;
  },

  // Nouvelle méthode pour récupérer TOUTES les ventes historiques
  async getAllSales(): Promise<Sale[]> {
    const response: AxiosResponse<Sale[]> = await api.get('/api/sales');
    return response.data;
  },

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.post('/api/sales', sale);
    return response.data;
  },

  async updateSale(sale: Sale): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.put(`/api/sales/${sale.id}`, sale);
    return response.data;
  },

  async deleteSale(id: string): Promise<boolean> {
    await api.delete(`/api/sales/${id}`);
    return true;
  },

  async exportMonth(month: number, year: number): Promise<boolean> {
    await api.post('/api/sales/export-month', { month, year });
    return true;
  },
};

// Depense Service
export const depenseService = {
  async getMouvements(): Promise<DepenseDuMois[]> {
    const response: AxiosResponse<DepenseDuMois[]> = await api.get('/api/depenses/mouvements');
    return response.data;
  },

  async addMouvement(mouvement: Omit<DepenseDuMois, 'id'>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.post('/api/depenses/mouvements', mouvement);
    return response.data;
  },

  async updateMouvement(id: string, mouvement: Partial<DepenseDuMois>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.put(`/api/depenses/mouvements/${id}`, mouvement);
    return response.data;
  },

  async deleteMouvement(id: string): Promise<boolean> {
    await api.delete(`/api/depenses/mouvements/${id}`);
    return true;
  },

  async getDepensesFixe(): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.get('/api/depenses/fixe');
    return response.data;
  },

  async updateDepensesFixe(depensesFixe: Partial<DepenseFixe>): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.put('/api/depenses/fixe', depensesFixe);
    return response.data;
  },

  async resetMouvements(): Promise<boolean> {
    await api.post('/api/depenses/reset');
    return true;
  },
};

// PretFamille Service
export const pretFamilleService = {
  async getPretFamilles(): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get('/api/pretfamilles');
    return response.data;
  },

  async addPretFamille(pret: Omit<PretFamille, 'id'>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.post('/api/pretfamilles', pret);
    return response.data;
  },

  async updatePretFamille(id: string, pret: Partial<PretFamille>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.put(`/api/pretfamilles/${id}`, pret);
    return response.data;
  },

  async deletePretFamille(id: string): Promise<boolean> {
    await api.delete(`/api/pretfamilles/${id}`);
    return true;
  },

  async searchByName(name: string): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get(`/api/pretfamilles/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },
};

// PretProduit Service
export const pretProduitService = {
  async getPretProduits(): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await api.get('/api/pretproduits');
    return response.data;
  },

  async addPretProduit(pret: Omit<PretProduit, 'id'>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.post('/api/pretproduits', pret);
    return response.data;
  },

  async updatePretProduit(id: string, pret: Partial<PretProduit>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.put(`/api/pretproduits/${id}`, pret);
    return response.data;
  },

  async deletePretProduit(id: string): Promise<boolean> {
    await api.delete(`/api/pretproduits/${id}`);
    return true;
  },
};

// Export the api instance for direct use if needed
export { api };
export default api;
