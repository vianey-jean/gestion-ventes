
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, Sale } from '../types';
import { productService, salesService } from '../service/api';
import { useToast } from '@/hooks/use-toast';

// Interface pour le contexte AppContext
interface AppContextType {
  products: Product[];                                 // Liste des produits
  sales: Sale[];                                       // Liste des ventes
  currentMonth: number;                                // Mois actuel
  currentYear: number;                                 // Année actuelle 
  isLoading: boolean;                                  // État de chargement
  error: string | null;                                // Message d'erreur
  fetchProducts: () => Promise<void>;                  // Fonction pour récupérer les produits
  fetchSales: () => Promise<void>;                     // Fonction pour récupérer les ventes
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>; // Ajouter un produit
  updateProduct: (product: Product) => Promise<Product | null>;          // Mettre à jour un produit
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale | null>;             // Ajouter une vente
  updateSale: (sale: Sale) => Promise<Sale | null>;                      // Mettre à jour une vente
  deleteSale: (id: string) => Promise<boolean>;                          // Supprimer une vente
  searchProducts: (query: string) => Promise<Product[]>;                 // Rechercher des produits
  exportMonth: () => Promise<boolean>;                                   // Exporter le mois
}

// Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

// Fournisseur du contexte AppContext
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // États
  const [products, setProducts] = useState<Product[]>([]);     // État pour les produits
  const [sales, setSales] = useState<Sale[]>([]);              // État pour les ventes
  const [isLoading, setIsLoading] = useState(false);           // État de chargement
  const { toast } = useToast();                                // Hook pour les notifications

  // Date actuelle
  const today = new Date();
  const [currentMonth] = useState(today.getMonth());
  const [currentYear] = useState(today.getFullYear());

  // Cache pour les recherches
  const [searchCache, setSearchCache] = useState<Record<string, Product[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);  // Pour le chargement initial

  // Chargement initial des données
  useEffect(() => {
    if (!initialLoadDone) {
      const loadInitialData = async () => {
        try {
          await Promise.all([fetchProducts(), fetchSales()]);
        } catch (error) {
          console.error("Initial data load error:", error);
        } finally {
          setInitialLoadDone(true);
        }
      };
      
      loadInitialData();
    }
  }, [initialLoadDone]);

  // Fonction pour récupérer les produits
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Impossible de récupérer les produits");
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les produits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les ventes
  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await salesService.getSales(currentMonth, currentYear);
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setError("Impossible de récupérer les ventes");
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les ventes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour ajouter un produit
  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newProduct = await productService.addProduct(product);
      
      // Mettre à jour la liste des produits sans refetch
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
        className: "notification-success",
      });
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Impossible d'ajouter le produit");
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

  // Fonction pour mettre à jour un produit
  const updateProduct = async (product: Product): Promise<Product | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(product);
      
      // Mettre à jour la liste des produits sans refetch
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? updatedProduct : p)
      );
      
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
        className: "notification-success",
      });
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Impossible de mettre à jour le produit");
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

  // Fonction pour ajouter une vente
  const addSale = async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newSale = await salesService.addSale(sale);
      
      // Mettre à jour la liste des ventes sans refetch
      setSales(prevSales => [...prevSales, newSale]);
      
      // Mettre à jour le produit concerné
      await fetchProducts();
      
      toast({
        title: "Succès",
        description: "Vente ajoutée avec succès",
        className: "notification-success",
      });
      return newSale;
    } catch (error) {
      console.error("Error adding sale:", error);
      setError("Impossible d'ajouter la vente");
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

  // Fonction pour mettre à jour une vente
  const updateSale = async (sale: Sale): Promise<Sale | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSale = await salesService.updateSale(sale);
      
      // Mettre à jour la liste des ventes sans refetch
      setSales(prevSales => 
        prevSales.map(s => s.id === sale.id ? updatedSale : s)
      );
      
      // Mettre à jour le produit concerné
      await fetchProducts();
      
      toast({
        title: "Succès",
        description: "Vente mise à jour avec succès",
        className: "notification-success",
      });
      return updatedSale;
    } catch (error) {
      console.error("Error updating sale:", error);
      setError("Impossible de mettre à jour la vente");
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

  // Fonction pour supprimer une vente
  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await salesService.deleteSale(id);
      
      if (success) {
        // Supprimer la vente de la liste sans refetch
        setSales(prevSales => prevSales.filter(s => s.id !== id));
        
        // Mettre à jour les produits
        await fetchProducts();
        
        toast({
          title: "Succès",
          description: "Vente supprimée avec succès",
          className: "notification-success",
        });
      }
      return success;
    } catch (error) {
      console.error("Error deleting sale:", error);
      setError("Impossible de supprimer la vente");
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

  // Fonction pour rechercher des produits
  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      if (!query || query.length < 3) return [];
      
      const normalizedQuery = query.toLowerCase().trim();
      
      // Utiliser le cache si disponible
      if (searchCache[normalizedQuery]) {
        console.log(`Using cached results for "${normalizedQuery}"`);
        return searchCache[normalizedQuery];
      }
      
      console.log(`Searching for products with query: "${normalizedQuery}"`);
      
      // Rechercher d'abord dans les produits locaux
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
      
      // Sinon, faire une requête API
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

  // Fonction pour exporter le mois
  const exportMonth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await salesService.exportSalesToPdf(currentMonth, currentYear);
      
      if (success) {
        // Vider la liste des ventes sans refetch
        setSales([]);
        
        toast({
          title: "Succès",
          description: "Les ventes ont été exportées et réinitialisées pour le mois prochain",
          className: "notification-success",
        });
      }
      return success;
    } catch (error) {
      console.error("Error exporting sales:", error);
      setError("Impossible d'exporter les ventes");
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

  // Valeur du contexte
  const value = {
    products,
    sales,
    currentMonth,
    currentYear,
    isLoading,
    error,
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

// Hook pour utiliser le contexte AppContext
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
