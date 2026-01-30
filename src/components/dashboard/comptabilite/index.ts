/**
 * INDEX - Exports du module Comptabilité
 * 
 * Ce fichier centralise tous les exports des composants du module Comptabilité.
 * Il permet une importation simplifiée depuis d'autres parties de l'application.
 * 
 * COMPOSANTS EXPORTÉS :
 * - ComptabiliteModule : Composant principal du module
 * - ProductSearchInput : Champ de recherche de produit avec suggestions
 * - ComptabiliteStatsCards : Cartes de statistiques (Crédit, Débit, Bénéfices)
 * - AchatsHistoriqueList : Liste historique des achats et dépenses
 * - AchatFormDialog : Formulaire modal d'ajout d'achat
 * - DepenseFormDialog : Formulaire modal d'ajout de dépense
 * - StableBarChart, StablePieChart : Graphiques stables pour les charts
 * 
 * NOUVEAUX COMPOSANTS (v2):
 * - ClickableStatCard : Carte de statistique cliquable avec effet premium
 * - DetailsModal : Modale générique pour afficher les détails
 * - AchatsProduitsDetails : Liste détaillée des achats produits
 * - AutresDepensesDetails : Liste détaillée des autres dépenses
 * - SoldeNetDetails : Détail du calcul du solde net
 * 
 * UTILISATION :
 * import { ComptabiliteModule, AchatFormDialog } from '@/components/dashboard/comptabilite';
 * import { ClickableStatCard, DetailsModal } from '@/components/dashboard/comptabilite/shared';
 * import { AchatsProduitsDetails } from '@/components/dashboard/comptabilite/details';
 */

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export { default as ComptabiliteModule } from './ComptabiliteModule';

// ============================================
// COMPOSANTS DE FORMULAIRE
// ============================================
export { default as AchatFormDialog } from './AchatFormDialog';
export type { AchatFormDialogProps } from './AchatFormDialog';

export { default as DepenseFormDialog } from './DepenseFormDialog';
export type { DepenseFormDialogProps } from './DepenseFormDialog';

export { default as ProductSearchInput } from './ProductSearchInput';
export type { ProductSearchInputProps } from './ProductSearchInput';

// ============================================
// COMPOSANTS D'AFFICHAGE
// ============================================
export { default as ComptabiliteStatsCards } from './ComptabiliteStatsCards';
export type { ComptabiliteStatsCardsProps } from './ComptabiliteStatsCards';

export { default as AchatsHistoriqueList } from './AchatsHistoriqueList';
export type { AchatsHistoriqueListProps } from './AchatsHistoriqueList';

// ============================================
// COMPOSANTS DE GRAPHIQUES
// ============================================
export { StableBarChart, StablePieChart } from './StableCharts';

// ============================================
// COMPOSANTS PARTAGÉS (RÉUTILISABLES)
// ============================================
export { ClickableStatCard, DetailsModal } from './shared';
export type { ClickableStatCardProps, DetailsModalProps } from './shared';

// ============================================
// COMPOSANTS DE DÉTAILS
// ============================================
export { AchatsProduitsDetails, AutresDepensesDetails, SoldeNetDetails } from './details';
export type { AchatsProduitsDetailsProps, AutresDepensesDetailsProps, SoldeNetDetailsProps } from './details';
