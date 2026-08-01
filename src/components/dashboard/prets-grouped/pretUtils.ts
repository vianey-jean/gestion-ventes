/**
 * Types & utilitaires partagés des composants Prêts Produits
 */
import { Product, PretProduit } from '@/types';

export type StatModalType = 'totalVentes' | 'avances' | 'reste' | 'pretsPayes' | null;

export type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

export const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'perruque', label: 'Perruque' },
  { value: 'tissage', label: 'Tissage' },
  { value: 'extension', label: 'Extension' },
  { value: 'autres', label: 'Autres' },
];

export const filterProductsByCategory = (products: Product[], category: ProductCategory): Product[] => {
  if (category === 'all') return products;
  const check = (p: Product) => p.description.toLowerCase();
  switch (category) {
    case 'perruque': return products.filter(p => check(p).includes('perruque'));
    case 'tissage': return products.filter(p => check(p).includes('tissage'));
    case 'extension': return products.filter(p => check(p).includes('extension'));
    case 'autres': return products.filter(p =>
      !check(p).includes('perruque') && !check(p).includes('tissage') && !check(p).includes('extension')
    );
    default: return products;
  }
};

export interface GroupedPrets {
  nom: string;
  phone?: string;
  prets: PretProduit[];
  totalPrixVente: number;
  totalAvance: number;
  totalReste: number;
  allPaid: boolean;
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export const isDatePaiementDepassee = (datePaiement: string) => {
  const date = new Date(datePaiement);
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < aujourdhui;
};

export const getDatePaiementClass = (pret: PretProduit) => {
  if (!pret.datePaiement) return 'font-bold text-green-600';
  const isDepassee = isDatePaiementDepassee(pret.datePaiement);
  if (pret.estPaye) return 'font-bold text-green-600';
  return isDepassee ? 'font-bold text-red-600 animate-pulse' : 'font-bold text-green-600';
};
