/**
 * Utilitaires & types partagés pour les composants Versement espèce
 */

export type Versement = {
  id: string;
  date: string;
  montant: number;
  description?: string;
  createdAt?: string;
};

export type Bank = { id: string; name: string };

export type ForecastRow = { date: Date; disponible: number; libere: number };

export const formatAmount = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

export const formatDateFR = (d: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    }).format(new Date(d));
  } catch {
    return d;
  }
};

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
