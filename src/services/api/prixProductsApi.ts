/**
 * prixProductsApi.ts — Service API pour l'historique des prix d'achat
 */
import api from './api';

export interface PrixProductEntry {
  id: string;
  productId: string | null;
  productDescription: string;
  purchasePrice: number;
  previousPrice: number | null;
  variationPercent: number;
  variationType: 'augmentation' | 'diminution' | 'stable';
  quantity: number;
  disponible: boolean;
  fournisseur: string;
  caracteristiques: string;
  date: string;
  isNewProduct: boolean;
  createdAt: string;
}

export interface PrixProductPayload {
  productId?: string | null;
  productDescription: string;
  purchasePrice: number;
  previousPrice?: number | null;
  quantity?: number;
  disponible?: boolean;
  fournisseur?: string;
  caracteristiques?: string;
  date?: string;
  isNewProduct?: boolean;
}

export const prixProductsApiService = {
  async getAll(): Promise<PrixProductEntry[]> {
    const res = await api.get<{ entries: PrixProductEntry[] }>('/api/prix-products');
    return res.data?.entries || [];
  },
  async getByProduct(productId: string): Promise<PrixProductEntry[]> {
    const res = await api.get<{ entries: PrixProductEntry[] }>(`/api/prix-products/product/${productId}`);
    return res.data?.entries || [];
  },
  async create(payload: PrixProductPayload): Promise<PrixProductEntry> {
    const res = await api.post<PrixProductEntry>('/api/prix-products', payload);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/prix-products/${id}`);
  }
};

export default prixProductsApiService;
