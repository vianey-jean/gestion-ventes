
export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    address: string;
    phone: string;
  }
  
  export interface Product {
    id: string;
    description: string;
    purchasePrice: number;
    quantity: number;
  }
  
  export interface Sale {
    id: string;
    date: string;
    productId: string;
    description: string;
    sellingPrice: number;
    quantitySold: number;
    purchasePrice: number;
    profit: number;
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
  