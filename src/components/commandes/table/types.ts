/**
 * Types partagés pour les composants du tableau des commandes.
 */
import type { Commande, CommandeStatut } from '@/types/commande';
import type { FideliteInfo } from './useFideliteData';

export interface CommandeRowProps {
  commande: Commande;
  handleEdit: (commande: Commande) => void;
  handleStatusChange: (id: string, status: CommandeStatut | 'reporter') => void;
  setDeleteId: (id: string) => void;
  getStatusOptions: (type: 'commande' | 'reservation' | 'rdv') => { value: string; label: string }[];
  onClientClick?: (commande: Commande) => void;
  onProductClick?: (produitNom: string) => void;
  locked?: boolean;
  fidelite?: FideliteInfo | null;
}

export const getCommandeTotal = (commande: Commande): number =>
  commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);
