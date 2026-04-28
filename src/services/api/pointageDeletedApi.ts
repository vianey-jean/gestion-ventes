/**
 * pointageDeletedApi — Empreintes des pointages supprimés
 *
 * Empêche le pointage automatique de recréer un pointage qui a été supprimé
 * manuellement par l'admin. Seule une création manuelle peut le remettre.
 */
import api from './api';

export interface PointageDeletedFingerprint {
  date: string;
  travailleurId: string;
  entrepriseId: string;
  deletedAt?: string;
}

const pointageDeletedApi = {
  getAll: () => api.get<PointageDeletedFingerprint[]>('/api/pointages-deleted'),
  add: (data: Omit<PointageDeletedFingerprint, 'deletedAt'>) =>
    api.post('/api/pointages-deleted', data),
  remove: (data: Omit<PointageDeletedFingerprint, 'deletedAt'>) =>
    api.delete('/api/pointages-deleted', { data }),
};

export default pointageDeletedApi;
