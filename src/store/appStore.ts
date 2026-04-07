/**
 * App Store — État global de l'application (Zustand)
 * 
 * Centralise : produits, ventes, clients, chargement, erreurs
 * Remplace progressivement AppContext pour de meilleures performances
 */
import { create } from 'zustand';
import { Product, Sale } from '@/types';

interface AppState {
  // Data
  products: Product[];
  sales: Sale[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastSync: number | null;

  // Actions
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addSale: (sale: Sale) => void;
  updateSale: (sale: Sale) => void;
  removeSale: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markSynced: () => void;
  reset: () => void;
}

const initialState = {
  products: [] as Product[],
  sales: [] as Sale[],
  isLoading: false,
  error: null as string | null,
  lastSync: null as number | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setProducts: (products) => set({ products, lastSync: Date.now() }),
  setSales: (sales) => set({ sales, lastSync: Date.now() }),

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  addSale: (sale) =>
    set((state) => ({ sales: [...state.sales, sale] })),
  updateSale: (sale) =>
    set((state) => ({
      sales: state.sales.map((s) => (s.id === sale.id ? sale : s)),
    })),
  removeSale: (id) =>
    set((state) => ({
      sales: state.sales.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  markSynced: () => set({ lastSync: Date.now() }),
  reset: () => set(initialState),
}));
