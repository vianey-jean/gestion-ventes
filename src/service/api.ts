import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Product, Sale, User, LoginCredentials, RegisterCredentials, PretFamille, PretProduit, DepenseFixe, DepenseDuMois } from '@/types';

// Configuration de l'URL de base
const getBaseURL = () => {
  // Utiliser toujours l'URL de production pour éviter les problèmes CORS
  return import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
};

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false, // Désactiver les credentials pour éviter les problèmes CORS
  });

  // Configure retry logic
  axiosRetry(instance, {
    retries: 2, // Réduire le nombre de tentatives
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
      // Réduire le spam dans la console
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.code !== 'ERR_NETWORK') {
        console.error('API Error:', error);
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
    try {
      console.log('📦 Fetching products from API...');
      const response: AxiosResponse<Product[]> = await api.get('/api/products');
      console.log(`✅ Retrieved ${response.data.length} products from API`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('📝 Adding new product:', product);
      const response: AxiosResponse<Product> = await api.post('/api/products', product);
      console.log('✅ Product added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      console.log('📝 Updating product:', product);
      const response: AxiosResponse<Product> = await api.put(`/api/products/${product.id}`, product);
      console.log('✅ Product updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting product with ID:', id);
      const response = await api.delete(`/api/products/${id}`);
      console.log('✅ Product deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
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

// Benefice Service
export const beneficeService = {
  async getBenefices(): Promise<any[]> {
    try {
      console.log('📊 Fetching benefices from API...');
      const response = await api.get('/api/benefices');
      console.log(`✅ Retrieved ${response.data.length} benefices from API`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching benefices:', error);
      throw error;
    }
  },

  async getBeneficeByProductId(productId: string): Promise<any> {
    try {
      const response = await api.get(`/api/benefices/product/${productId}`);
      return response.data;
    } catch (error) {
      console.log('Aucune donnée de bénéfice existante pour ce produit');
      return null;
    }
  },

  async createBenefice(beneficeData: any): Promise<any> {
    try {
      console.log('📝 Adding new benefice:', beneficeData);
      const response = await api.post('/api/benefices', beneficeData);
      console.log('✅ Benefice added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding benefice:', error);
      throw error;
    }
  },

  async updateBenefice(id: string, beneficeData: any): Promise<any> {
    try {
      console.log('📝 Updating benefice:', beneficeData);
      const response = await api.put(`/api/benefices/${id}`, beneficeData);
      console.log('✅ Benefice updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating benefice:', error);
      throw error;
    }
  },

  async deleteBenefice(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting benefice with ID:', id);
      await api.delete(`/api/benefices/${id}`);
      console.log('✅ Benefice deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting benefice:', error);
      throw error;
    }
  },
};

// Export the api instance for direct use if needed
export { api };
export default api;
