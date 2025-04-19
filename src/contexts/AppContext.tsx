import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, Sale } from '../types';
import { productService, salesService } from '../service/api';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  currentMonth: number;
  currentYear: number;
  isLoading: boolean;
  error: string | null;  // Ajout de la propriété error
  fetchProducts: () => Promise<void>;
  fetchSales: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale | null>;
  updateSale: (sale: Sale) => Promise<Sale | null>;
  deleteSale: (id: string) => Promise<boolean>;
  searchProducts: (query: string) => Promise<Product[]>;
  exportMonth: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date();
  const [currentMonth] = useState(today.getMonth());
  const [currentYear] = useState(today.getFullYear());

  const [searchCache, setSearchCache] = useState<Record<string, Product[]>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les produits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getSales(currentMonth, currentYear);
      setSales(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les ventes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      setIsLoading(true);
      const newProduct = await productService.addProduct(product);
      await fetchProducts();
      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
        className: "notification-success",
      });
      return newProduct;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (product: Product): Promise<Product | null> => {
    try {
      setIsLoading(true);
      const updatedProduct = await productService.updateProduct(product);
      await fetchProducts();
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
        className: "notification-success",
      });
      return updatedProduct;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
    try {
      setIsLoading(true);
      const newSale = await salesService.addSale(sale);
      await fetchSales();
      await fetchProducts();
      toast({
        title: "Succès",
        description: "Vente ajoutée avec succès",
        className: "notification-success",
      });
      return newSale;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la vente",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSale = async (sale: Sale): Promise<Sale | null> => {
    try {
      setIsLoading(true);
      const updatedSale = await salesService.updateSale(sale);
      await fetchSales();
      await fetchProducts();
      toast({
        title: "Succès",
        description: "Vente mise à jour avec succès",
        className: "notification-success",
      });
      return updatedSale;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la vente",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await salesService.deleteSale(id);
      if (success) {
        await fetchSales();
        await fetchProducts();
        toast({
          title: "Succès",
          description: "Vente supprimée avec succès",
          className: "notification-success",
        });
      }
      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      if (!query || query.length < 3) return [];
      
      const normalizedQuery = query.toLowerCase().trim();
      
      if (searchCache[normalizedQuery]) {
        console.log(`Using cached results for "${normalizedQuery}"`);
        return searchCache[normalizedQuery];
      }
      
      console.log(`Searching for products with query: "${normalizedQuery}"`);
      
      if (products.length > 0) {
        const localResults = products.filter(p => 
          p.description.toLowerCase().includes(normalizedQuery)
        );
        
        if (localResults.length > 0) {
          console.log(`Found ${localResults.length} local results`);
          setSearchCache(prev => ({...prev, [normalizedQuery]: localResults}));
          return localResults;
        }
      }
      
      const searchResults = await productService.searchProducts(query);
      console.log(`Found ${searchResults.length} API results`);
      
      setSearchCache(prev => ({...prev, [normalizedQuery]: searchResults}));
      
      return searchResults;
    } catch (error) {
      console.error("Search products error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les produits",
        variant: "destructive",
      });
      return [];
    }
  }, [products, toast]);

  const exportMonth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await salesService.exportSalesToPdf(currentMonth, currentYear);
      if (success) {
        await fetchSales();
        toast({
          title: "Succès",
          description: "Les ventes ont été exportées et réinitialisées pour le mois prochain",
          className: "notification-success",
        });
      }
      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les ventes",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    products,
    sales,
    currentMonth,
    currentYear,
    isLoading,
    error: null,  // Ajout de la valeur error
    fetchProducts,
    fetchSales,
    addProduct,
    updateProduct,
    addSale,
    updateSale,
    deleteSale,
    searchProducts,
    exportMonth,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
