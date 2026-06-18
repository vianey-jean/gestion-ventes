// Types pour les ventes

export interface SaleProduct {
  productId: string;
  description: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  deliveryFee?: number;
  deliveryLocation?: string;
  /** Montant ou pourcentage saisi pour la réduction */
  reduction?: number;
  /** Type de réduction: 'amount' (par unité) ou 'percent' (% du PU) */
  reductionType?: '' | 'amount' | 'percent';
  /** Prix de vente total AVANT application de la réduction */
  sellingPriceBeforeReduction?: number;
  /** Montant total de réduction appliquée */
  reductionAmount?: number;
  /** Tarif standard de la ville (avant ajustement) */
  originalDeliveryFee?: number;
  /** Ajustement appliqué sur les frais (- réduction / + augmentation) */
  deliveryFeeAdjustment?: number;
}

export interface Sale {
  id: string;
  date: string;
  // Nouvelle structure multi-produits
  products?: SaleProduct[];
  totalPurchasePrice?: number;
  totalSellingPrice?: number;
  totalProfit?: number;
  totalDeliveryFee?: number;
  // Ancien format pour compatibilité
  productId?: string;
  description?: string;
  quantitySold?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  profit?: number;
  deliveryFee?: number;
  // Informations client
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientVille?: string;
  // Informations d'avance
  reste?: number;
  nextPaymentDate?: string;
  // Remboursement
  isRefund?: boolean;
  originalSaleId?: string;
}

export interface SaleFormData {
  date: string;
  products: SaleProduct[];
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
}
