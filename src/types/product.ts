// Types pour les produits

export interface Product {
  id: string;
  code?: string; // Code unique du produit (7 caractères: P/T + chiffres + lettres)
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
  reserver?: string; // "oui" si le produit est réservé
}

export interface ProductFormData {
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
}
