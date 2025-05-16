
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

export interface Sale {
  id: string;
  productId: string;
  description: string;
  date: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
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
  montant: number;
  date: string;
  status: 'en_cours' | 'remboursé';
}

export interface PretProduit {
  id: string;
  description: string;
  nom?: string;
  date: string;
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
