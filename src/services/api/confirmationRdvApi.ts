import api from './api';
import { RDV } from '@/types/rdv';

export interface ConfirmationRdvEntry {
  id: string;
  titre: string;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  lieu?: string;
  description?: string;
  produits?: { nom: string; quantite: number; prixUnitaire: number; prixVente: number }[];
  commandeId?: string | null;
  statutRdv: string;
  confirmationStatut: 'en_attente' | 'maintenu' | 'annule' | 'reporter';
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const confirmationRdvApi = {
  async getAll(): Promise<ConfirmationRdvEntry[]> {
    const res = await api.get('/api/confirmation-rdv');
    return res.data || [];
  },
  async sync(entries: RDV[]): Promise<ConfirmationRdvEntry[]> {
    const res = await api.post('/api/confirmation-rdv/sync', { entries });
    return res.data || [];
  },
  async update(
    id: string,
    payload: { confirmationStatut: 'maintenu' | 'annule' | 'reporter'; date?: string; heureDebut?: string; heureFin?: string }
  ): Promise<ConfirmationRdvEntry> {
    const res = await api.patch(`/api/confirmation-rdv/${id}`, payload);
    return res.data;
  },
};

export default confirmationRdvApi;
