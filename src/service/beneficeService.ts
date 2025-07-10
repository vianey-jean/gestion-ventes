
import axios, { AxiosResponse } from 'axios';

interface BeneficeData {
  id?: string;
  productId: string;
  productDescription: string;
  prixAchat: number;
  taxeDouane: number;
  tva: number;
  autresFrais: number;
  coutTotal: number;
  margeDesire: number;
  prixVenteRecommande: number;
  beneficeNet: number;
  tauxMarge: number;
  createdAt?: string;
  updatedAt?: string;
}

const getBaseURL = () => {
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    return 'http://localhost:10000';
  }
  return import.meta.env.VITE_API_BASE_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Benefice API Error:', error);
    return Promise.reject(error);
  }
);

export const beneficeService = {
  async getBenefices(): Promise<BeneficeData[]> {
    try {
      const response: AxiosResponse<BeneficeData[]> = await api.get('/api/benefices');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des bénéfices:', error);
      return [];
    }
  },

  async getBeneficeByProductId(productId: string): Promise<BeneficeData | null> {
    try {
      const response: AxiosResponse<BeneficeData> = await api.get(`/api/benefices/product/${productId}`);
      return response.data;
    } catch (error) {
      console.log('Aucune donnée de bénéfice existante pour ce produit');
      return null;
    }
  },

  async createBenefice(beneficeData: Omit<BeneficeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<BeneficeData> {
    const response: AxiosResponse<BeneficeData> = await api.post('/api/benefices', beneficeData);
    return response.data;
  },

  async updateBenefice(id: string, beneficeData: Partial<BeneficeData>): Promise<BeneficeData> {
    const response: AxiosResponse<BeneficeData> = await api.put(`/api/benefices/${id}`, beneficeData);
    return response.data;
  },

  async deleteBenefice(id: string): Promise<boolean> {
    await api.delete(`/api/benefices/${id}`);
    return true;
  }
};
