/**
 * Store — Point d'entrée centralisé pour le state management (Zustand)
 * 
 * Architecture MVC :
 * - Models (types/) : définitions des données
 * - Views (components/, pages/) : affichage
 * - Controllers (store/) : logique d'état et actions
 */
export { useAppStore } from './appStore';
export { useAuthStore } from './authStore';
