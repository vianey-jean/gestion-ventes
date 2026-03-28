/**
 * index.ts — Export centralisé des composants partagés (shared)
 * 
 * Composants réutilisables dans tout le projet :
 * - UnifiedSearchBar : barre de recherche unifiée
 * - PageHero : en-tête héroïque de page
 * - Pagination : composant de pagination
 * - LoadingOverlay : overlay de chargement
 * - ConfirmDialog : dialogue de confirmation
 * - AddressActionModal : modal d'actions pour les adresses (Google Maps)
 * - StatBadge : badge de statistique
 */

export { default as UnifiedSearchBar } from './UnifiedSearchBar';
export type { UnifiedSearchBarProps } from './UnifiedSearchBar';

export { default as PageHero } from './PageHero';
export type { PageHeroProps } from './PageHero';

export { default as Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export { default as LoadingOverlay } from './LoadingOverlay';
export type { LoadingOverlayProps } from './LoadingOverlay';

export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { default as AddressActionModal, useAddressNavigation } from './AddressActionModal';
export type { AddressActionModalProps } from './AddressActionModal';

export { default as StatBadge } from './StatBadge';
export type { StatBadgeProps } from './StatBadge';
