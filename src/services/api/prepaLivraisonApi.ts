import api from './api';
import { Commande } from '@/types/commande';

export interface PrepaLivraisonEntry {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: 'commande' | 'reservation';
  produits: { nom: string; prixUnitaire: number; quantite: number; prixVente: number }[];
  dateArrivagePrevue?: string | null;
  dateEcheance?: string | null;
  horaire?: string | null;
  horaireFin?: string | null;
  statut: string;
  clientCaracteristique?: string | null;
  termine: boolean;
  statutLivraison: 'en_cours' | 'fini';
  createdAt: string;
  updatedAt: string;
}

export const prepaLivraisonApi = {
  async getAll(): Promise<PrepaLivraisonEntry[]> {
    const res = await api.get('/api/prepa-livraison');
    return res.data || [];
  },
  async sync(entries: Commande[]): Promise<PrepaLivraisonEntry[]> {
    const res = await api.post('/api/prepa-livraison/sync', { entries });
    return res.data || [];
  },
  async setTermine(id: string, termine: boolean): Promise<PrepaLivraisonEntry> {
    const res = await api.patch(`/api/prepa-livraison/${id}`, { termine });
    return res.data;
  }
};

export default prepaLivraisonApi;
