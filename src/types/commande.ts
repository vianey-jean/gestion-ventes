// Types pour les commandes

export type CommandeReductionType = '' | 'amount' | 'percent';

export interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
  /** Réduction appliquée à la ligne (facultatif) */
  reduction?: number;
  reductionType?: CommandeReductionType;
  /** Livraison */
  deliveryLocation?: string;
  deliveryFee?: number;
  /** Frais de base de la ville (avant override) */
  baseDeliveryFee?: number;
}

export type CommandeType = 'commande' | 'reservation' | 'rdv';
export type CommandeStatut = 'en_attente' | 'en_route' | 'arrive' | 'valide' | 'annule' | 'reporter';

export interface Commande {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateCommande: string;
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  horaireFin?: string;
  statut: CommandeStatut;
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
  saleId?: string;
  overdueTimerStart?: string;
  clientCaracteristique?: string;
  /** Id du RDV lié dans rdv-taches.json (si type 'rdv') */
  rdvTacheId?: string;
}

export interface CommandeFormData {
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  horaireFin?: string;
}
