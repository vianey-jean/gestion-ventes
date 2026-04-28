/**
 * pointageAutoSessionsApi — Synchronisation multi-admin des notifications
 * de pointage automatique (voir server/routes/pointageAutoSessions.js).
 */
import api from './api';

export interface PointageAutoSession {
  id: string;
  ruleId: string;
  date: string; // YYYY-MM-DD
  travailleurId: string;
  entrepriseId: string;
  startedAt: string; // ISO
  expiresAt: string; // ISO
  status: 'pending' | 'validated' | 'cancelled';
  closedAt: string | null;
  closedBy: string | null;
}

const pointageAutoSessionsApi = {
  getAll: (status?: 'pending' | 'validated' | 'cancelled') =>
    api.get<PointageAutoSession[]>(
      `/api/pointages-auto-sessions${status ? `?status=${status}` : ''}`
    ),
  create: (data: {
    ruleId: string;
    date: string;
    travailleurId: string;
    entrepriseId: string;
    durationMs?: number;
  }) => api.post<PointageAutoSession>('/api/pointages-auto-sessions', data),
  update: (id: string, data: { status: 'validated' | 'cancelled'; closedBy?: string }) =>
    api.patch<PointageAutoSession>(`/api/pointages-auto-sessions/${id}`, data),
};

export default pointageAutoSessionsApi;
