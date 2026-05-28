/**
 * historiqueConnexionApi.ts — API client pour l'historique des connexions / visites.
 */
import api from './api';

export interface HistoriqueEntry {

  id: string;
  type: 'login_success' | 'login_failed' | 'login_locked' | 'visit';
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  statut?: string;
  message?: string;
  page?: string;
  referrer?: string;
  sessionId?: string;
  date: string;
}


const historiqueConnexionApi = {
  getAll: () => api.get<HistoriqueEntry[]>('/api/historique-connexion'),
  logVisit: (payload: Partial<HistoriqueEntry> = {}) =>
    api.post('/api/historique-connexion/visit', payload),
  reset: () => api.delete('/api/historique-connexion'),
};

export default historiqueConnexionApi;
