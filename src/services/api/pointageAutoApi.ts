/**
 * pointageAutoApi — Client API pour le pointage automatique
 *
 * Gère les règles configurées dans ProfilePage > Paramètres > Pointage automatique.
 * Chaque règle décrit une personne, un ou plusieurs jours, une entreprise et le
 * paiement (horaire/journalier). Quand active=true, un watcher global vérifie
 * chaque jour si le pointage doit être créé automatiquement dans pointage.json.
 */
import api from './api';

export interface PointageAutoEntry {
  id: string;
  travailleurId: string;
  travailleurNom: string;
  /** Tableau de jours ['lundi','mardi',...] ou 'toute' pour toute la semaine */
  jours: string[] | 'toute';
  entrepriseId: string;
  entrepriseNom: string;
  typePaiement: 'journalier' | 'horaire';
  heures: number;
  prixHeure: number;
  prixJournalier: number;
  montantTotal: number;
  active: boolean;
  /** Désactivation permanente — ne peut plus être réactivé */
  permanentlyDisabled?: boolean;
  /** Date de début à partir de laquelle les pointages rétroactifs doivent être générés (YYYY-MM-DD) */
  reactivationStartDate?: string | null;
  createdAt?: string;
}

const pointageAutoApi = {
  getAll: () => api.get<PointageAutoEntry[]>('/api/pointages-auto'),
  getById: (id: string) => api.get<PointageAutoEntry>(`/api/pointages-auto/${id}`),
  create: (data: Omit<PointageAutoEntry, 'id' | 'createdAt'>) =>
    api.post<PointageAutoEntry>('/api/pointages-auto', data),
  update: (id: string, data: Partial<PointageAutoEntry>) =>
    api.put<PointageAutoEntry>(`/api/pointages-auto/${id}`, data),
  delete: (id: string) => api.delete(`/api/pointages-auto/${id}`),
};

export default pointageAutoApi;
