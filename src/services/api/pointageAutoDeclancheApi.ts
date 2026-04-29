/**
 * pointageAutoDeclancheApi — Persistence du chrono multi-admin
 *
 * Quand une règle de pointage automatique doit déclencher un chrono,
 * on enregistre l'état dans `pointageautodeclanche.json` côté serveur.
 * Tout admin qui se connecte plus tard récupère le `startedAt` initial
 * et reprend le chrono là où il en est (pas de remise à zéro).
 */
import api from './api';

export interface PointageAutoDeclancheEntry {
  id: string;
  ruleId: string;
  date: string;
  travailleurId: string;
  entrepriseId: string;
  active: boolean;
  chronoDeclanche: boolean;
  startedAt: string;
  expiresAt: string;
  status: 'pending' | 'validated' | 'cancelled';
  closedAt: string | null;
  closedBy: string | null;
}

const pointageAutoDeclancheApi = {
  getAll: (params?: { status?: string; ruleId?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.ruleId) q.set('ruleId', params.ruleId);
    if (params?.date) q.set('date', params.date);
    const qs = q.toString();
    return api.get<PointageAutoDeclancheEntry[]>(
      `/api/pointages-auto-declanche${qs ? `?${qs}` : ''}`
    );
  },
  create: (data: {
    ruleId: string;
    date: string;
    travailleurId: string;
    entrepriseId: string;
    durationMs?: number;
  }) => api.post<PointageAutoDeclancheEntry>('/api/pointages-auto-declanche', data),
  update: (
    id: string,
    data: { status: 'validated' | 'cancelled' | 'pending'; closedBy?: string }
  ) => api.patch<PointageAutoDeclancheEntry>(`/api/pointages-auto-declanche/${id}`, data),
};

export default pointageAutoDeclancheApi;
