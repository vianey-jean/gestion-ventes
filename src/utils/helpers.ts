/**
 * Helpers — Fonctions utilitaires génériques
 */

/** Formater un montant en devise */
export const formatCurrency = (amount: number, currency = 'EUR', locale = 'fr-FR'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/** Formater une date en français */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', options || { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Formater un nombre avec séparateurs */
export const formatNumber = (num: number, locale = 'fr-FR'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/** Tronquer un texte */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};

/** Générer un ID unique */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/** Debounce une fonction */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Throttle une fonction */
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};
