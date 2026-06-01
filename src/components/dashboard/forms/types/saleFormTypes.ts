import { Product } from '@/types';

export type ReductionType = '' | 'amount' | 'percent';

export interface FormProduct {
  productId: string;
  description: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
  selectedProduct: Product | null;
  maxQuantity: number;
  isAdvanceProduct: boolean;
  isPretProduit: boolean;
  deliveryLocation: string;
  deliveryFee: string;
  avancePretProduit: string;
  reduction: string;
  reductionType: ReductionType;
}

export const createEmptyFormProduct = (): FormProduct => ({
  productId: '',
  description: '',
  sellingPriceUnit: '',
  quantitySold: '1',
  purchasePriceUnit: '',
  profit: '',
  selectedProduct: null,
  maxQuantity: 0,
  isAdvanceProduct: false,
  isPretProduit: false,
  deliveryLocation: 'Saint-Denis',
  deliveryFee: '0',
  avancePretProduit: '',
  reduction: '',
  reductionType: '',
});

/**
 * Calcule le montant total de la réduction appliquée à une ligne produit.
 * - 'amount' : montant déduit par unité
 * - 'percent' : pourcentage du prix de vente unitaire
 */
export const computeReductionAmount = (
  sellingPriceUnit: number,
  quantity: number,
  reduction: number,
  type: ReductionType
): number => {
  if (!reduction || !type) return 0;
  if (type === 'percent') {
    const unitDiscount = (sellingPriceUnit * reduction) / 100;
    return Math.max(0, unitDiscount * quantity);
  }
  // 'amount' : déduction par unité
  return Math.max(0, reduction * quantity);
};
