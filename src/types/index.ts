// Types pour l'application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
}

export interface SaleProduct {
  productId: string;
  description: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
}

export interface Sale {
  id: string;
  date: string;
  // Nouvelle structure multi-produits
  products?: SaleProduct[];
  totalPurchasePrice?: number;
  totalSellingPrice?: number;
  totalProfit?: number;
  // Ancien format pour compatibilité
  productId?: string;
  description?: string;
  quantitySold?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  profit?: number;
  // Nouvelles informations client pour la facturation
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
}

export interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
}

export interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  dernierRemboursement: number;
  dateRemboursement: string;
}

export interface PretProduit {
  id: string;
  description: string;
  nom?: string;
  date: string; // date de prêt
  datePaiement?: string; // nouvelle date de paiement
  phone?: string; // nouveau numéro de téléphone
  prixVente: number;
  avanceRecue: number;
  reste: number;
  estPaye: boolean;
  productId?: string;
}

export interface DepenseFixe {
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total: number;
}

export interface DepenseDuMois {
  id: string;
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
  solde: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
