/**
 * Utils — Fonctions utilitaires centralisées
 * 
 * Point d'entrée unique pour toutes les fonctions utilitaires.
 * Nouveau code doit importer depuis @/utils au lieu de @/lib.
 */
export { cn } from '@/lib/utils';
export { formatCurrency, formatDate, formatNumber, truncateText, generateId, debounce, throttle } from './helpers';
export { validateEmail, validatePhone, validateRequired, sanitizeInput } from './validators';
