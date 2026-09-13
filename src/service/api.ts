/**
 * COUCHE DE COMPATIBILITÉ — Redirige vers src/services/api/
 * 
 * Ce fichier maintient la rétrocompatibilité avec les anciens imports :
 *   import { productService } from '@/service/api'
 * 
 * Tous les services réels sont dans src/services/api/.
 * Pour les nouveaux développements, importer directement depuis @/services/api.
 */

import apiInstance, { getBaseURL } from '@/services/api/api';
import { productApiService } from '@/services/api/productApi';
import { saleApiService } from '@/services/api/saleApi';
import { clientApiService } from '@/services/api/clientApi';
import { beneficeApiService } from '@/services/api/beneficeApi';
import { commandeApiService } from '@/services/api/commandeApi';
import { depenseApiService } from '@/services/api/depenseApi';
import { pretFamilleApiService } from '@/services/api/pretFamilleApi';
import { pretProduitApiService } from '@/services/api/pretProduitApi';
import type { Product, Sale, PretFamille, PretProduit, DepenseFixe, DepenseDuMois } from '@/types';

// ===============================
// Wrappers de compatibilité
// Mappent les anciens noms de méthodes vers les nouveaux services
// ===============================

export const authService = {
  // ============================================================
  // CONNEXION — étape 1: identifiants -> étape 2: code OTP
  // ============================================================
  async login(credentials: { email: string; password: string; channel?: 'email' | 'sms' }) {
    const response = await apiInstance.post('/api/auth/login', credentials);
    return response.data; // { requires2FA, challengeId, method, maskedDestination, expiresAt }
  },
  async verifyLoginOtp(data: { challengeId: string; code: string }) {
    const response = await apiInstance.post('/api/auth/login/verify-otp', data);
    const result = response.data;
    if (result?.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },
  async resendLoginOtp(challengeId: string) {
    const response = await apiInstance.post('/api/auth/login/resend-otp', { challengeId });
    return response.data;
  },

  // ============================================================
  // INSCRIPTION — étape 1: infos (sans mdp) -> étape 2: code OTP -> étape 3: mdp
  // ============================================================
  async register(credentials: any) {
    // Étape 1 uniquement : PAS de mot de passe envoyé ici, pas de session créée.
    const { password, confirmPassword, ...profileData } = credentials || {};
    const response = await apiInstance.post('/api/auth/register', profileData);
    return response.data; // { pendingRegistration, challengeId, method, maskedDestination }
  },
  async verifyRegisterOtp(data: { challengeId: string; code: string }) {
    const response = await apiInstance.post('/api/auth/register/verify-otp', data);
    return response.data; // { verified, setupToken, email }
  },
  async resendRegisterOtp(challengeId: string) {
    const response = await apiInstance.post('/api/auth/register/resend-otp', { challengeId });
    return response.data;
  },
  async completeRegistration(data: { setupToken: string; password: string; confirmPassword: string }) {
    const response = await apiInstance.post('/api/auth/register/complete', data);
    return response.data; // { user, token, verified, registeredAt }
  },

  async checkEmail(email: string) {
    const response = await apiInstance.post('/api/auth/check-email', { email });
    return response.data;
  },

  // ============================================================
  // MOT DE PASSE OUBLIÉ — demande -> code OTP -> nouveau mot de passe
  // ============================================================
  async resetPasswordRequest(data: { email: string; channel?: 'email' | 'sms' }) {
    try {
      const response = await apiInstance.post('/api/auth/forgot-password', data);
      return response.data; // { exists, challengeId?, method?, maskedDestination? }
    } catch {
      return { exists: false };
    }
  },
  async verifyForgotPasswordOtp(data: { challengeId: string; code: string }) {
    const response = await apiInstance.post('/api/auth/forgot-password/verify-otp', data);
    return response.data; // { verified, resetToken }
  },
  async resendForgotPasswordOtp(challengeId: string) {
    const response = await apiInstance.post('/api/auth/forgot-password/resend-otp', { challengeId });
    return response.data;
  },
  async resetPassword(data: { resetToken: string; newPassword: string; confirmPassword: string }) {
    const response = await apiInstance.post('/api/auth/reset-password', data);
    return response.data; // { success, message }
  },

  // ============================================================
  // CHANGEMENT DE MOT DE PASSE (utilisateur connecté)
  // ============================================================
  async requestChangePasswordOtp(channel?: 'email' | 'sms') {
    const response = await apiInstance.post('/api/auth/change-password/request', { channel });
    return response.data; // { challengeId, method, maskedDestination }
  },
  async resendChangePasswordOtp(challengeId: string) {
    const response = await apiInstance.post('/api/auth/change-password/resend-otp', { challengeId });
    return response.data;
  },
  async verifyChangePassword(data: {
    challengeId: string;
    code: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await apiInstance.post('/api/auth/change-password/verify', data);
    return response.data; // { success, message }
  },

  async verifyToken() {
    const response = await apiInstance.get('/api/auth/verify');
    return response.data;
  },
  async healthCheck() {
    const response = await apiInstance.get('/api/auth/health');
    return response.data;
  },
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch { return null; }
  },
  setCurrentUser(user: any) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
};

export const productService = {
  getProducts: () => productApiService.getAll(),
  addProduct: (product: Omit<Product, 'id'>) => productApiService.create(product as any),
  updateProduct: (product: Product) => productApiService.update(product.id, product as any),
  deleteProduct: (id: string) => productApiService.delete(id),
  uploadProductPhotos: async (productId: string, photos: File[], mainPhotoIndex: number) => {
    const formData = new FormData();
    photos.forEach((photo) => formData.append('photos', photo));
    formData.append('mainPhotoIndex', mainPhotoIndex.toString());
    const token = localStorage.getItem('token');
    const baseURL = getBaseURL();
    const response = await fetch(`${baseURL}/api/products/${productId}/photos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },
  replaceProductPhotos: async (productId: string, newPhotos: File[], existingPhotoUrls: string[], mainPhotoIndex: number) => {
    const formData = new FormData();
    newPhotos.forEach((photo) => formData.append('photos', photo));
    formData.append('photosJson', JSON.stringify(existingPhotoUrls));
    formData.append('mainPhotoIndex', mainPhotoIndex.toString());
    const token = localStorage.getItem('token');
    const baseURL = getBaseURL();
    const response = await fetch(`${baseURL}/api/products/${productId}/photos`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },
  generateCodesForExistingProducts: async () => {
    const response = await apiInstance.post('/api/products/generate-codes');
    return response.data;
  },
};

export const salesService = {
  getSales: (month?: number, year?: number) => {
    if (month !== undefined && year !== undefined) {
      return saleApiService.getByMonth(month, year);
    }
    return saleApiService.getAll();
  },
  getAllSales: () => saleApiService.getAll(),
  addSale: (sale: Omit<Sale, 'id'>) => saleApiService.create(sale),
  updateSale: (sale: Sale) => saleApiService.update(sale.id, sale),
  deleteSale: (id: string) => saleApiService.delete(id),
  exportMonth: (month: number, year: number) => saleApiService.exportMonth(month, year),
};

export const depenseService = {
  getMouvements: async (): Promise<DepenseDuMois[]> => {
    const response = await apiInstance.get('/api/depenses/mouvements');
    return response.data;
  },
  addMouvement: async (mouvement: Omit<DepenseDuMois, 'id'>) => {
    const response = await apiInstance.post('/api/depenses/mouvements', mouvement);
    return response.data;
  },
  updateMouvement: async (id: string, mouvement: Partial<DepenseDuMois>) => {
    const response = await apiInstance.put(`/api/depenses/mouvements/${id}`, mouvement);
    return response.data;
  },
  deleteMouvement: async (id: string) => {
    await apiInstance.delete(`/api/depenses/mouvements/${id}`);
    return true;
  },
  getDepensesFixe: async (): Promise<DepenseFixe> => {
    const response = await apiInstance.get('/api/depenses/fixe');
    return response.data;
  },
  updateDepensesFixe: async (depensesFixe: Partial<DepenseFixe>) => {
    const response = await apiInstance.put('/api/depenses/fixe', depensesFixe);
    return response.data;
  },
  resetMouvements: async () => {
    await apiInstance.post('/api/depenses/reset');
    return true;
  },
  getRsa: async () => {
    const response = await apiInstance.get('/api/depenses/rsa');
    return response.data;
  },
  updateRsa: async (montant: number) => {
    const response = await apiInstance.put('/api/depenses/rsa', { montant });
    return response.data;
  },
  autoAddEntries: async () => {
    const response = await apiInstance.post('/api/depenses/auto-entries');
    return response.data;
  },
};

export const versementService = {
  getAll: async () => {
    const response = await apiInstance.get('/api/versements');
    return response.data as { maxMonthly: number; versements: Array<{ id: string; date: string; montant: number; description?: string; createdAt?: string }> };
  },
  add: async (data: { date: string; montant: number; description?: string }) => {
    const response = await apiInstance.post('/api/versements', data);
    return response.data;
  },
  update: async (id: string, data: Partial<{ date: string; montant: number; description: string }>) => {
    const response = await apiInstance.put(`/api/versements/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    await apiInstance.delete(`/api/versements/${id}`);
    return true;
  },
  setMax: async (maxMonthly: number) => {
    const response = await apiInstance.put('/api/versements/max', { maxMonthly });
    return response.data;
  },
};

export const bankService = {
  getAll: async () => {
    const response = await apiInstance.get('/api/banks');
    return response.data as Array<{ id: string; name: string; createdAt?: string }>;
  },
  add: async (name: string) => {
    const response = await apiInstance.post('/api/banks', { name });
    return response.data;
  },
  remove: async (id: string) => {
    await apiInstance.delete(`/api/banks/${id}`);
    return true;
  },
};

export const pretFamilleService = {
  getPretFamilles: () => pretFamilleApiService.getAll(),
  addPretFamille: (pret: Omit<PretFamille, 'id'>) => pretFamilleApiService.create(pret),
  updatePretFamille: (id: string, pret: Partial<PretFamille>) => pretFamilleApiService.update(id, pret),
  deletePretFamille: (id: string) => pretFamilleApiService.delete(id),
  searchByName: async (name: string) => {
    const response = await apiInstance.get(`/api/pretfamilles/search/nom?q=${encodeURIComponent(name)}`);
    return response.data;
  },
};

export const pretProduitService = {
  getPretProduits: () => pretProduitApiService.getAll(),
  addPretProduit: (pret: Omit<PretProduit, 'id'>) => pretProduitApiService.create(pret),
  updatePretProduit: (id: string, pret: Partial<PretProduit>) => pretProduitApiService.update(id, pret),
  deletePretProduit: (id: string) => pretProduitApiService.delete(id),
  transferPrets: async (fromName: string, toName: string, pretIds: string[]) => {
    const response = await apiInstance.post('/api/pretproduits/transfer', { fromName, toName, pretIds });
    return response.data;
  },
};

export const beneficeService = {
  getBenefices: () => beneficeApiService.getAll(),
  getBeneficeByProductId: (productId: string) => beneficeApiService.getByProductId(productId),
  createBenefice: (data: any) => beneficeApiService.create(data),
  updateBenefice: (id: string, data: any) => beneficeApiService.update(id, data),
  deleteBenefice: (id: string) => beneficeApiService.delete(id),
};

export const marketingService = {
  async generateDescription(productData: any) {
    const response = await apiInstance.post('/api/marketing/generate-description', productData);
    return response.data;
  },
};

export const commandeService = {
  getCommandes: () => commandeApiService.getAll(),
  getCommandeById: (id: string) => commandeApiService.getById(id),
  createCommande: (commande: any) => commandeApiService.create(commande),
  updateCommande: (id: string, commande: any) => commandeApiService.update(id, commande),
  deleteCommande: (id: string) => commandeApiService.delete(id),
};

export const clientService = {
  getClients: () => clientApiService.getAll(),
  getClientById: (id: string) => clientApiService.getById(id),
  createClient: (client: any) => clientApiService.create(client),
  updateClient: (id: string, client: any) => clientApiService.update(id, client),
  deleteClient: (id: string) => clientApiService.delete(id),
};

// Export l'instance axios pour usage direct
export { apiInstance as api };
export { getBaseURL };
export default apiInstance;
