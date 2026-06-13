// Types pour les nouveaux achats et dépenses

export interface NouvelleAchat {
  id: string;
  date: string;
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur: string;
  caracteristiques: string;
  totalCost: number;
  type: 'achat_produit' | 'taxes' | 'carburant' | 'autre_depense';
  description?: string;
  categorie?: string;
  /** URL relative (ex: /uploads/depense/recu-xxx.pdf) du reçu de dépense — facultatif */
  receiptUrl?: string | null;
  /** Indique si la quantité de cet achat est disponible à la vente (défaut: true) */
  disponible?: boolean;
  /** Index de l'achat dans product.achats (rempli côté serveur à la création) */
  productAchatIndex?: number | null;
}

export interface NouvelleAchatFormData {
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur?: string;
  caracteristiques?: string;
  date?: string;
  /** Disponibilité de l'achat (défaut: true). Si false, la quantité n'est PAS vendable. */
  disponible?: boolean;
}

export interface DepenseFormData {
  description: string;
  montant: number;
  type: 'taxes' | 'carburant' | 'autre_depense';
  categorie?: string;
  date?: string;
  /** URL du reçu déjà uploadé (utilisée côté backend lors de l'enregistrement) */
  receiptUrl?: string | null;
}

export interface MonthlyStats {
  totalAchats: number;
  totalDepenses: number;
  achatsCount: number;
  depensesCount: number;
  totalGeneral: number;
  byType: Record<string, { total: number; count: number }>;
}

export interface YearlyStats extends MonthlyStats {
  byMonth: Record<number, { achats: number; depenses: number }>;
}

export interface ComptabiliteData {
  // Données des ventes
  salesTotal: number;
  salesProfit: number;
  salesCost: number;
  salesCount: number;
  
  // Données des achats/dépenses
  achatsTotal: number;
  depensesTotal: number;
  
  // Calculs finaux
  beneficeReel: number;
  totalDebit: number;
  totalCredit: number;
  soldeNet: number;
}