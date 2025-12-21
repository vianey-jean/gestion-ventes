import axios from 'axios';
import { RDV, RDVFormData } from '@/types/rdv';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const rdvApiService = {
  // Récupérer tous les rendez-vous
  async getAll(): Promise<RDV[]> {
    const response = await api.get('/api/rdv');
    return response.data;
  },

  // Récupérer un rendez-vous par ID
  async getById(id: string): Promise<RDV> {
    const response = await api.get(`/api/rdv/${id}`);
    return response.data;
  },

  // Créer un nouveau rendez-vous
  async create(data: RDVFormData): Promise<RDV> {
    const response = await api.post('/api/rdv', data);
    return response.data;
  },

  // Mettre à jour un rendez-vous
  async update(id: string, data: Partial<RDVFormData>): Promise<RDV> {
    const response = await api.put(`/api/rdv/${id}`, data);
    return response.data;
  },

  // Supprimer un rendez-vous
  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/rdv/${id}`);
    return true;
  },

  // Rechercher des rendez-vous
  async search(query: string): Promise<RDV[]> {
    const response = await api.get(`/api/rdv/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Récupérer les rendez-vous par semaine
  async getByWeek(startDate: string, endDate: string): Promise<RDV[]> {
    const response = await api.get(`/api/rdv/week?start=${startDate}&end=${endDate}`);
    return response.data;
  },

  // Vérifier les conflits
  async checkConflicts(date: string, heureDebut: string, heureFin: string, excludeId?: string): Promise<RDV[]> {
    const params = new URLSearchParams({ date, heureDebut, heureFin });
    if (excludeId) params.append('excludeId', excludeId);
    const response = await api.get(`/api/rdv/conflicts?${params.toString()}`);
    return response.data;
  }
};

export default rdvApiService;
