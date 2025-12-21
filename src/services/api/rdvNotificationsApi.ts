import axios from 'axios';

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

export interface RdvNotification {
  id: string;
  rdvId: string;
  rdvTitre: string;
  rdvClientNom: string;
  rdvClientTelephone: string;
  rdvDate: string;
  rdvHeureDebut: string;
  rdvHeureFin: string;
  rdvLieu: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const rdvNotificationsApi = {
  // Récupérer toutes les notifications
  async getAll(): Promise<RdvNotification[]> {
    const response = await api.get('/api/rdv-notifications');
    return response.data;
  },

  // Récupérer les notifications non lues
  async getUnread(): Promise<RdvNotification[]> {
    const response = await api.get('/api/rdv-notifications/unread');
    return response.data;
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/api/rdv-notifications/count');
    return response.data.count;
  },

  // Vérifier et créer les notifications pour les RDV dans 24h
  async checkAndCreate(): Promise<{ created: number; notifications: RdvNotification[] }> {
    const response = await api.post('/api/rdv-notifications/check');
    return response.data;
  },

  // Marquer comme lu
  async markAsRead(id: string): Promise<boolean> {
    const response = await api.put(`/api/rdv-notifications/${id}/read`);
    return response.data.success;
  },

  // Supprimer une notification
  async delete(id: string): Promise<boolean> {
    const response = await api.delete(`/api/rdv-notifications/${id}`);
    return response.data.success;
  },

  // Récupérer notification par rdv ID
  async getByRdvId(rdvId: string): Promise<RdvNotification | null> {
    try {
      const response = await api.get(`/api/rdv-notifications/by-rdv/${rdvId}`);
      return response.data;
    } catch {
      return null;
    }
  }
};

export default rdvNotificationsApi;