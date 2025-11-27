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
  statut: 'en_route' | 'arrive' | 'en_attente' | 'valide';
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
}
