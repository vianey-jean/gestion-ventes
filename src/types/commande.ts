export interface Commande {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: 'commande' | 'reservation';
  produits: CommandeProduit[];
  dateCommande: string;
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  statut: 'en_route' | 'arrive' | 'en_attente' | 'valide' | 'annule' | 'reporter';
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
  saleId?: string; // ID de la vente liée quand statut = 'valide'
}

export interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
}
