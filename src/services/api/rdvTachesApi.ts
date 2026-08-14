import api from './api';

export type RdvTacheStatut = 'planifie' | 'confirme' | 'annule' | 'reporte' | 'termine';

/** Produit rattaché à un RDV-tâche (panier enregistré dans rdv-taches.json) */
export interface RdvProduit {
  productId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  prixVente: number;
  deliveryLocation?: string;
  deliveryFee?: number;
}



export interface RdvTache {
  id: string;
  personneId?: string;
  personneNom?: string;
  clientId?: string;
  clientNom: string;
  clientTelephone?: string;
  tacheId?: string;
  tacheNom: string;
  lieu?: string;
  telephone?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  commentaires?: string;
  statut: RdvTacheStatut;
  createdAt?: string;
  updatedAt?: string;
  commandeId?: string;
  /** Panier produits associé au RDV */
  produits?: RdvProduit[];
  /** Id de la vente générée quand le RDV passe en "terminé" */
  saleId?: string;
  clientAdresse?: string;
}

export interface FreeSlot { start: string; end: string; }

const rdvTachesApi = {
  getAll: () => api.get<RdvTache[]>('/api/rdv-taches'),
  getByMonth: (year: number, month: number) =>
    api.get<RdvTache[]>(`/api/rdv-taches?year=${year}&month=${month}`),
  getByDate: (date: string) => api.get<RdvTache[]>(`/api/rdv-taches?date=${date}`),
  getFreeSlots: (date: string) =>
    api.get<FreeSlot[]>(`/api/rdv-taches/free-slots?date=${encodeURIComponent(date)}`),
  create: (data: Omit<RdvTache, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<RdvTache>('/api/rdv-taches', data),
  update: (id: string, data: Partial<RdvTache>) =>
    api.put<RdvTache>(`/api/rdv-taches/${id}`, data),
  delete: (id: string) => api.delete(`/api/rdv-taches/${id}`),
  updateByCommande: (commandeId: string, data: Partial<RdvTache>) =>
    api.put<RdvTache>(`/api/rdv-taches/by-commande/${commandeId}`, data),
  deleteByCommande: (commandeId: string) => api.delete(`/api/rdv-taches/by-commande/${commandeId}`),
};

export default rdvTachesApi;
