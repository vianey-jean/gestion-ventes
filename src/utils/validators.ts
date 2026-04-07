/**
 * Validators — Fonctions de validation des entrées
 */

/** Valider un email */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/** Valider un numéro de téléphone */
export const validatePhone = (phone: string): boolean => {
  return /^[\d\s+()-]{8,20}$/.test(phone);
};

/** Valider qu'un champ n'est pas vide */
export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/** Nettoyer les entrées utilisateur */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};
