// We need to add typings to handle boolean returns from the API
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, Sale } from '@/types';
import { productService, salesService } from '@/service/api';
import { useAuth } from '@/contexts/AuthContext';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchSales: (month?: number, year?: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale | null>;
  updateSale: (sale: Sale) => Promise<Sale | null>;
  deleteSale: (id: string) => Promise<boolean>;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  // Add missing properties reported in the TypeScript errors
  currentMonth: number;
  currentYear: number;
  isLoading: boolean;
  searchProducts: (query: string) => Promise<Product[]>;
  exportMonth: () => Promise<boolean>;
  // Add refreshData for real-time sync
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Fonction pour obtenir le mois et l'année actuels
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1, // Convert to 1-based (1-12)
      year: now.getFullYear()
    };
  };

  // Initialiser toujours avec le mois en cours
  const [currentDate, setCurrentDate] = useState(getCurrentMonthYear());
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Toujours utiliser le mois en cours - pas de sélection manuelle
  const selectedMonth = currentDate.month;
  const selectedYear = currentDate.year;
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Add the missing properties that components are expecting - Use consistent 1-based indexing
  const currentMonth = selectedMonth; // This will be 1-based (1 = January)
  const currentYear = selectedYear;
  const isLoading = loading;

  // Fonction pour vérifier et mettre à jour le mois en cours
  const checkAndUpdateCurrentMonth = useCallback(() => {
    const newDate = getCurrentMonthYear();
    if (newDate.month !== currentDate.month || newDate.year !== currentDate.year) {
      console.log(`Changement de mois détecté: ${currentDate.month}/${currentDate.year} -> ${newDate.month}/${newDate.year}`);
      setCurrentDate(newDate);
      // Vider les ventes existantes car on change de mois
      setSales([]);
      toast({
        title: "Nouveau mois",
        description: `Passage au mois ${newDate.month}/${newDate.year}. Les données ont été rafraîchies.`,
      });
    }
  }, [currentDate, toast]);

  // Vérifier le changement de mois toutes les minutes
  useEffect(() => {
    const interval = setInterval(checkAndUpdateCurrentMonth, 60000); // Vérifier chaque minute
    return () => clearInterval(interval);
  }, [checkAndUpdateCurrentMonth]);

  // Fonctions pour la compatibilité (même si on ne permet plus la sélection manuelle)
  const setSelectedMonth = (month: number) => {
    console.log('setSelectedMonth appelé mais ignoré - utilisation du mois en cours uniquement');
  };
  
  const setSelectedYear = (year: number) => {
    console.log('setSelectedYear appelé mais ignoré - utilisation de l\'année en cours uniquement');
  };

  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.log('User not authenticated, skipping product fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
      console.log(`Fetched ${fetchedProducts.length} products`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les produits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, isAuthenticated, authLoading]);

  const fetchSales = useCallback(async (month?: number, year?: number) => {
    if (!isAuthenticated || authLoading) {
      console.log('User not authenticated, skipping sales fetch');
      return;
    }
    
    // Toujours utiliser le mois en cours, ignorer les paramètres
    const monthToFetch = currentDate.month;
    const yearToFetch = currentDate.year;
    
    console.log(`Fetching sales for current month: ${monthToFetch} (1-based), year: ${yearToFetch}`);
    
    setLoading(true);
    setError(null);
    try {
      // API expects 1-based month, so pass it directly
      const fetchedSales = await salesService.getSales(monthToFetch, yearToFetch);
      console.log(`Fetched ${fetchedSales.length} sales for ${monthToFetch}/${yearToFetch}`);
      setSales(fetchedSales);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError(err.message || 'Failed to fetch sales');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les ventes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, currentDate, isAuthenticated, authLoading]);

  // Fonction de rafraîchissement pour la synchronisation temps réel
  const refreshData = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    try {
      await Promise.all([
        fetchProducts(),
        fetchSales()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    }
  }, [fetchProducts, fetchSales, isAuthenticated, authLoading]);

  // Charger les données seulement pour le mois en cours
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log(`User authenticated, fetching data for current month: ${currentDate.month}/${currentDate.year}`);
      fetchProducts();
      fetchSales();
    } else {
      console.log('User not authenticated or auth loading, clearing data');
      setProducts([]);
      setSales([]);
    }
  }, [isAuthenticated, authLoading, currentDate, fetchProducts, fetchSales]);

  // Add searchProducts function that is being used
  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      // Simple client-side search implementation
      return products.filter(product => 
        product.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  // Add exportMonth function
  const exportMonth = async (): Promise<boolean> => {
    try {
      // Implementation would depend on your API
      // For now, this is a placeholder that returns success
      return true;
    } catch (error) {
      console.error('Error exporting month:', error);
      return false;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot add product');
      return null;
    }
    
    try {
      const newProduct = await productService.addProduct(productData);
      if (newProduct) {
        setProducts(prevProducts => [...prevProducts, newProduct]);
        return newProduct;
      }
      return null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  };

  const updateProduct = async (product: Product): Promise<Product | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot update product');
      return null;
    }
    
    try {
      const updatedProduct = await productService.updateProduct(product);
      if (updatedProduct) {
        setProducts(prevProducts =>
          prevProducts.map(p => (p.id === product.id ? updatedProduct : p))
        );
        return updatedProduct;
      }
      return null;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  };
  
  const addSale = async (saleData: Omit<Sale, 'id'>): Promise<Sale | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot add sale');
      return null;
    }
    
    try {
      const result = await salesService.addSale(saleData);
      
      // Update local state only if we get a Sale object back
      if (result && typeof result !== 'boolean') {
        // Check if the new sale belongs to the current month/year
        const saleDate = new Date(result.date);
        const saleMonth = saleDate.getMonth() + 1; // Convert from 0-based to 1-based
        const saleYear = saleDate.getFullYear();
        
        console.log(`New sale added for ${saleMonth}/${saleYear}, current month is ${currentDate.month}/${currentDate.year}`);
        
        if (saleMonth === currentDate.month && saleYear === currentDate.year) {
          setSales(prevSales => [...prevSales, result]);
        } else {
          console.log("Sale added but for a different month than current");
          toast({
            title: "Vente ajoutée",
            description: `La vente a été ajoutée pour le mois de ${saleMonth}/${saleYear}, différent du mois en cours.`,
          });
        }
        return result;
      }
      
      // If we got a boolean result, still consider it a success but return null
      if (result === true) {
        await fetchSales();
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding sale:', error);
      return null;
    }
  };

  const updateSale = async (sale: Sale): Promise<Sale | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot update sale');
      return null;
    }
    
    try {
      const result = await salesService.updateSale(sale);
      
      // Update local state only if we get a Sale object back
      if (result && typeof result !== 'boolean') {
        setSales(prevSales =>
          prevSales.map(s => (s.id === sale.id ? result : s))
        );
        return result;
      }
      
      // If we got a boolean result, still consider it a success but return null
      if (result === true) {
        await fetchSales();
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating sale:', error);
      return null;
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot delete sale');
      return false;
    }
    
    try {
      const success = await salesService.deleteSale(id);
      if (success) {
        setSales(prevSales => prevSales.filter(sale => sale.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting sale:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        sales,
        setSales,
        loading,
        error,
        fetchProducts,
        fetchSales,
        addProduct,
        updateProduct,
        addSale,
        updateSale,
        deleteSale,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        // Add the new properties to the context value
        currentMonth,
        currentYear,
        isLoading,
        searchProducts,
        exportMonth,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
