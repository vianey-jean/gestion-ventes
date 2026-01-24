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
 * UTILISATION :
 * import { ComptabiliteModule, AchatFormDialog } from '@/components/dashboard/comptabilite';
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
