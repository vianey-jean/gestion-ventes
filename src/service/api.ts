
import axios from 'axios';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, Product, RegistrationData, Sale, User } from "../types";

// 🔁 URL de base récupérée depuis le fichier .env (Vite) - Correction pour pointer vers le serveur correct
const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

// ✅ Création de l'instance Axios
const api = axios.create({
  baseURL: `${AUTH_BASE_URL}/api`, // base de l'API commune à toutes les routes
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // ⏱️ Timeout de 10 secondes
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token found and added to request');
    } else {
      console.warn('No authentication token found - user may need to login');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    // Si l'erreur est un timeout, on ne retente pas
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timed out, not retrying to prevent cascading timeouts');
      return Promise.reject(error);
    }
    
    // Si l'erreur est 401 (non autorisé), vérifier si le token est expiré
    if (error.response && error.response.status === 401) {
      console.warn('Authentication failed - token may be expired');
      // Optionally redirect to login page or refresh token logic here
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      // Force page refresh to redirect to login if required
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Cache pour les produits
let productsCache = null;
let productsCacheExpiry = null;
const CACHE_DURATION = 60000; // 1 minute

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
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token') && !!localStorage.getItem('currentUser');
  }
};

// Product service with caching
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      // Vérifier si le token existe
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated when fetching products");
        return [];
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (productsCache && productsCacheExpiry && now < productsCacheExpiry) {
        console.log("Using cached products data");
        return productsCache;
      }

      console.log("Fetching fresh products data");
      const response = await api.get('/products');
      
      // Mettre à jour le cache
      productsCache = response.data;
      productsCacheExpiry = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get products error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      if (productsCache) {
        console.warn("Using expired cache due to API error");
        return productsCache;
      }
      return [];
    }
  },
  
  invalidateCache: () => {
    // Fonction pour invalider le cache après des modifications
    productsCache = null;
    productsCacheExpiry = null;
  },
  
  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await api.post('/products', product);
      productService.invalidateCache(); // Invalider le cache
      return response.data;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },
  
  updateProduct: async (product: Product): Promise<Product> => {
    try {
      const response = await api.put(`/products/${product.id}`, product);
      productService.invalidateCache(); // Invalider le cache
      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      // Essayer d'abord de trouver dans le cache
      if (productsCache) {
        const cachedProduct = productsCache.find(p => p.id === id);
        if (cachedProduct) {
          console.log("Using cached product data for ID:", id);
          return cachedProduct;
        }
      }
      
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
      
      // Essayer d'abord de chercher dans le cache
      if (productsCache) {
        console.log("Searching in cache first");
        const normalizedQuery = query.toLowerCase().trim();
        const results = productsCache.filter(p => 
          p.description.toLowerCase().includes(normalizedQuery)
        );
        
        if (results.length > 0) {
          console.log(`Found ${results.length} results in cache`);
          return results;
        }
      }
      
      const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Search products error:", error);
      return [];
    }
  }
};

// Cache pour les ventes
let salesCache = {};
let salesCacheExpiry = {};

// Sales service with caching
export const salesService = {
  getSales: async (month?: number, year?: number): Promise<Sale[]> => {
    try {
      let url = '/sales';
      let cacheKey = 'all';
      
      if (month !== undefined && year !== undefined) {
        // Make sure month is passed as a number between 1-12 (not 0-11)
        url = `/sales/by-month?month=${month}&year=${year}`;
        cacheKey = `${month}-${year}`;
        console.log(`Fetching sales for month=${month} year=${year}`);
      }
      
      // Vérifier si le token existe
      if (!authService.isAuthenticated()) {
        console.error('No authentication token found');
        return [];
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (salesCache[cacheKey] && salesCacheExpiry[cacheKey] && now < salesCacheExpiry[cacheKey]) {
        console.log(`Using cached sales data for ${cacheKey}`);
        return salesCache[cacheKey];
      }
      
      console.log(`Fetching fresh sales data for ${cacheKey}`);
      const response = await api.get(url);
      
      // Mettre à jour le cache
      salesCache[cacheKey] = response.data;
      salesCacheExpiry[cacheKey] = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get sales error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      const cacheKey = month !== undefined && year !== undefined ? `${month}-${year}` : 'all';
      if (salesCache[cacheKey]) {
        console.warn("Using expired cache due to API error");
        return salesCache[cacheKey];
      }
      return [];
    }
  },
  
  invalidateCache: (month?: number, year?: number) => {
    // Fonction pour invalider le cache après des modifications
    if (month !== undefined && year !== undefined) {
      const cacheKey = `${month}-${year}`;
      delete salesCache[cacheKey];
      delete salesCacheExpiry[cacheKey];
    } else {
      salesCache = {};
      salesCacheExpiry = {};
    }
  },
  
  addSale: async (sale: Omit<Sale, 'id'>): Promise<Sale | boolean> => {
    try {
      const response = await api.post('/sales', sale);
      // Invalider les caches
      salesService.invalidateCache();
      productService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Add sale error:", error);
      throw error;
    }
  },
  
  updateSale: async (sale: Sale): Promise<Sale | boolean> => {
    try {
      const response = await api.put(`/sales/${sale.id}`, sale);
      // Invalider les caches
      salesService.invalidateCache();
      productService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Update sale error:", error);
      throw error;
    }
  },
  
  deleteSale: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/sales/${id}`);
      // Invalider les caches
      salesService.invalidateCache();
      productService.invalidateCache();
      return true;
    } catch (error) {
      console.error("Delete sale error:", error);
      return false;
    }
  },
  
  exportSalesToPdf: async (month: number, year: number): Promise<boolean> => {
    try {
      const response = await api.post('/sales/export-month', { month, year });
      // Invalider les caches
      salesService.invalidateCache();
      return response.data.success;
    } catch (error) {
      console.error("Export sales error:", error);
      return false;
    }
  }
};

// Service pour les prêts aux familles
export const pretFamilleService = {
  _cache: null,
  _cacheExpiry: null,
  
  getPretFamilles: async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated when fetching pret familles");
        return [];
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (pretFamilleService._cache && pretFamilleService._cacheExpiry && now < pretFamilleService._cacheExpiry) {
        console.log("Using cached pret familles data");
        return pretFamilleService._cache;
      }

      console.log("Fetching fresh pret familles data");
      const response = await api.get('/pretfamilles');
      
      // Mettre à jour le cache
      pretFamilleService._cache = response.data;
      pretFamilleService._cacheExpiry = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get pret familles error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      if (pretFamilleService._cache) {
        console.warn("Using expired cache due to API error");
        return pretFamilleService._cache;
      }
      return [];
    }
  },
  
  searchByName: async (query: string) => {
    try {
      if (!query || query.length < 3) return [];
      
      // Essayer d'abord de chercher dans le cache
      if (pretFamilleService._cache) {
        console.log("Searching in cache first");
        const normalizedQuery = query.toLowerCase().trim();
        const results = pretFamilleService._cache.filter(pret => 
          pret.nom.toLowerCase().includes(normalizedQuery)
        );
        
        if (results.length > 0) {
          console.log(`Found ${results.length} results in cache`);
          return results;
        }
      }
      
      const response = await api.get(`/pretfamilles/search/nom?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Search pret familles error:", error);
      return [];
    }
  },
  
  addPretFamille: async (pretFamille) => {
    try {
      const response = await api.post('/pretfamilles', pretFamille);
      pretFamilleService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Add pret famille error:", error);
      throw error;
    }
  },
  
  updatePretFamille: async (id, pretFamille) => {
    try {
      const response = await api.put(`/pretfamilles/${id}`, pretFamille);
      pretFamilleService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Update pret famille error:", error);
      throw error;
    }
  },
  
  deletePretFamille: async (id) => {
    try {
      await api.delete(`/pretfamilles/${id}`);
      pretFamilleService.invalidateCache();
      return true;
    } catch (error) {
      console.error("Delete pret famille error:", error);
      return false;
    }
  },
  
  invalidateCache: () => {
    pretFamilleService._cache = null;
    pretFamilleService._cacheExpiry = null;
  }
};

// Service pour les prêts de produits
export const pretProduitService = {
  _cache: null,
  _cacheExpiry: null,
  
  getPretProduits: async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated when fetching pret produits");
        return [];
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (pretProduitService._cache && pretProduitService._cacheExpiry && now < pretProduitService._cacheExpiry) {
        console.log("Using cached pret produits data");
        return pretProduitService._cache;
      }

      console.log("Fetching fresh pret produits data");
      const response = await api.get('/pretproduits');
      
      // Mettre à jour le cache
      pretProduitService._cache = response.data;
      pretProduitService._cacheExpiry = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get pret produits error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      if (pretProduitService._cache) {
        console.warn("Using expired cache due to API error");
        return pretProduitService._cache;
      }
      return [];
    }
  },
  
  addPretProduit: async (pretProduit) => {
    try {
      const response = await api.post('/pretproduits', pretProduit);
      pretProduitService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Add pret produit error:", error);
      throw error;
    }
  },
  
  updatePretProduit: async (id, pretProduit) => {
    try {
      const response = await api.put(`/pretproduits/${id}`, pretProduit);
      pretProduitService.invalidateCache();
      return response.data;
    } catch (error) {
      console.error("Update pret produit error:", error);
      throw error;
    }
  },
  
  deletePretProduit: async (id) => {
    try {
      await api.delete(`/pretproduits/${id}`);
      pretProduitService.invalidateCache();
      return true;
    } catch (error) {
      console.error("Delete pret produit error:", error);
      return false;
    }
  },
  
  invalidateCache: () => {
    pretProduitService._cache = null;
    pretProduitService._cacheExpiry = null;
  }
};

// Service pour les dépenses du mois
export const depenseService = {
  _mouvementsCache: null,
  _mouvementsCacheExpiry: null,
  
  _depensesFixeCache: null,
  _depensesFixeCacheExpiry: null,
  
  getMouvements: async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated when fetching mouvements");
        return [];
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (depenseService._mouvementsCache && depenseService._mouvementsCacheExpiry && now < depenseService._mouvementsCacheExpiry) {
        console.log("Using cached mouvements data");
        return depenseService._mouvementsCache;
      }

      console.log("Fetching fresh mouvements data");
      const response = await api.get('/depenses/mouvements');
      
      // Mettre à jour le cache
      depenseService._mouvementsCache = response.data;
      depenseService._mouvementsCacheExpiry = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get mouvements error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      if (depenseService._mouvementsCache) {
        console.warn("Using expired cache due to API error");
        return depenseService._mouvementsCache;
      }
      return [];
    }
  },
  
  addMouvement: async (mouvement) => {
    try {
      const response = await api.post('/depenses/mouvements', mouvement);
      depenseService.invalidateMouvementsCache();
      return response.data;
    } catch (error) {
      console.error("Add mouvement error:", error);
      throw error;
    }
  },
  
  updateMouvement: async (id, mouvement) => {
    try {
      const response = await api.put(`/depenses/mouvements/${id}`, mouvement);
      depenseService.invalidateMouvementsCache();
      return response.data;
    } catch (error) {
      console.error("Update mouvement error:", error);
      throw error;
    }
  },
  
  deleteMouvement: async (id) => {
    try {
      await api.delete(`/depenses/mouvements/${id}`);
      depenseService.invalidateMouvementsCache();
      return true;
    } catch (error) {
      console.error("Delete mouvement error:", error);
      return false;
    }
  },
  
  getDepensesFixe: async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated when fetching depenses fixes");
        return {};
      }
      
      // Vérifier si le cache est valide
      const now = Date.now();
      if (depenseService._depensesFixeCache && depenseService._depensesFixeCacheExpiry && now < depenseService._depensesFixeCacheExpiry) {
        console.log("Using cached depenses fixe data");
        return depenseService._depensesFixeCache;
      }

      console.log("Fetching fresh depenses fixe data");
      const response = await api.get('/depenses/fixe');
      
      // Mettre à jour le cache
      depenseService._depensesFixeCache = response.data;
      depenseService._depensesFixeCacheExpiry = now + CACHE_DURATION;
      
      return response.data;
    } catch (error) {
      console.error("Get depenses fixe error:", error);
      // En cas d'erreur, retourner le cache s'il existe (même expiré)
      if (depenseService._depensesFixeCache) {
        console.warn("Using expired cache due to API error");
        return depenseService._depensesFixeCache;
      }
      return {};
    }
  },
  
  updateDepensesFixe: async (depensesFixe) => {
    try {
      const response = await api.put('/depenses/fixe', depensesFixe);
      depenseService.invalidateDepensesFixeCache();
      return response.data;
    } catch (error) {
      console.error("Update depenses fixe error:", error);
      throw error;
    }
  },
  
  resetMouvements: async () => {
    try {
      const response = await api.post('/depenses/reset');
      depenseService.invalidateMouvementsCache();
      return response.data;
    } catch (error) {
      console.error("Reset mouvements error:", error);
      throw error;
    }
  },
  
  checkMonthEnd: async () => {
    try {
      const response = await api.get('/depenses/check-month-end');
      if (response.data.reset) {
        depenseService.invalidateMouvementsCache();
      }
      return response.data;
    } catch (error) {
      console.error("Check month end error:", error);
      return { reset: false };
    }
  },
  
  invalidateMouvementsCache: () => {
    depenseService._mouvementsCache = null;
    depenseService._mouvementsCacheExpiry = null;
  },
  
  invalidateDepensesFixeCache: () => {
    depenseService._depensesFixeCache = null;
    depenseService._depensesFixeCacheExpiry = null;
  }
};
