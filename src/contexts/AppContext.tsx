// We need to add typings to handle boolean returns from the API
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, Sale } from '@/types';
import { productService, salesService } from '@/service/api';
import { useAuth } from '@/contexts/AuthContext';
import { isFormProtected } from '@/hooks/use-realtime-sync';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  allSales: Sale[]; // Toutes les ventes historiques pour les tendances
  setAllSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchSales: (month?: number, year?: number) => Promise<void>;
  fetchAllSales: () => Promise<void>; // Nouvelle fonction pour récupérer toutes les ventes
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale | null>;
  updateSale: (sale: Sale) => Promise<Sale | null>;
  deleteSale: (id: string) => Promise<boolean>;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  currentMonth: number;
  currentYear: number;
  isLoading: boolean;
  searchProducts: (query: string) => Promise<Product[]>;
  exportMonth: () => Promise<boolean>;
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
  const [allSales, setAllSales] = useState<Sale[]>([]); // Nouvelles données pour toutes les ventes
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
      // Changement de mois détecté
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
    // Ignoré - utilisation du mois en cours uniquement
  };
  
  const setSelectedYear = (_year: number) => {
    // Ignoré - utilisation de l'année en cours uniquement
  };

  // OPTIMIZED: Fast product fetching
  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }
    
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les produits.",
        variant: "destructive",
        className: "notification-erreur",
      });
    }
  }, [toast, isAuthenticated, authLoading]);

  // OPTIMIZED: Fast sales fetching
  const fetchSales = useCallback(async (month?: number, year?: number) => {
    if (!isAuthenticated || authLoading) {
      return;
    }
    
    const monthToFetch = currentDate.month;
    const yearToFetch = currentDate.year;
    
    try {
      const fetchedSales = await salesService.getSales(monthToFetch, yearToFetch);
      setSales(fetchedSales);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les ventes.",
        variant: "destructive",
        className: "notification-erreur",
      });
    }
  }, [toast, currentDate, isAuthenticated, authLoading]);

  // OPTIMIZED: Fast historical sales fetching
  const fetchAllSales = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }
    
    try {
      const fetchedAllSales = await salesService.getAllSales();
      setAllSales(fetchedAllSales);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all sales');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données historiques.",
        variant: "destructive",
        className: "notification-erreur",
      });
    }
  }, [toast, isAuthenticated, authLoading]);

  // OPTIMIZED: Fast parallel data refresh
  const refreshData = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    if (isFormProtected()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // PARALLEL: Fetch all data simultaneously for ultra-fast loading
      await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchAllSales()
      ]);
    } catch {
      // Refresh error handled silently
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchSales, fetchAllSales, isAuthenticated, authLoading]);

  // OPTIMIZED: Fast initial data loading on auth
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const loadInitialData = async () => {
        setLoading(true);
        
        // PARALLEL: Load all data simultaneously
        await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchAllSales()
      ]);
      
      setLoading(false);
      };
      
      loadInitialData();
    } else {
      setProducts([]);
      setSales([]);
      setAllSales([]);
    }
  }, [isAuthenticated, authLoading, currentDate, fetchProducts, fetchSales, fetchAllSales]);

  // Add searchProducts function that is being used
  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      // Simple client-side search implementation
      return products.filter(product => 
        product.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch {
      return [];
    }
  };

  // Add exportMonth function
  const exportMonth = async (): Promise<boolean> => {
    try {
      // Implementation would depend on your API
      // For now, this is a placeholder that returns success
      return true;
    } catch {
      return false;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      const newProduct = await productService.addProduct(productData);
      if (newProduct) {
        setProducts(prevProducts => [...prevProducts, newProduct]);
        return newProduct;
      }
      return null;
    } catch {
      return null;
    }
  };

  const updateProduct = async (product: Product): Promise<Product | null> => {
    if (!isAuthenticated) {
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
    } catch {
      return null;
    }
  };
  
  const addSale = async (saleData: Omit<Sale, 'id'>): Promise<Sale | null> => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      const result = await salesService.addSale(saleData);
      
      // Update local state - result should be a Sale object
      if (result && typeof result === 'object' && 'id' in result) {
        // Check if the new sale belongs to the current month/year
        const saleDate = new Date(result.date);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();
        
        if (saleMonth === currentDate.month && saleYear === currentDate.year) {
          setSales(prevSales => [...prevSales, result]);
        } else {
          toast({
            title: "Vente ajoutée",
            description: `La vente a été ajoutée pour le mois de ${saleMonth}/${saleYear}, différent du mois en cours.`,
          });
        }
        
        // Toujours ajouter à allSales pour les tendances
        setAllSales(prevAllSales => [...prevAllSales, result]);
        
        return result;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const updateSale = async (sale: Sale): Promise<Sale | null> => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      const result = await salesService.updateSale(sale);
      
      // Update local state - result should be a Sale object
      if (result && typeof result === 'object' && 'id' in result) {
        setSales(prevSales =>
          prevSales.map(s => (s.id === sale.id ? result : s))
        );
        
        // Mettre à jour aussi allSales
        setAllSales(prevAllSales =>
          prevAllSales.map(s => (s.id === sale.id ? result : s))
        );
        
        return result;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }
    
    try {
      const success = await salesService.deleteSale(id);
      if (success) {
        setSales(prevSales => prevSales.filter(sale => sale.id !== id));
        setAllSales(prevAllSales => prevAllSales.filter(sale => sale.id !== id));
        return true;
      }
      return false;
    } catch {
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
        allSales, // Nouvelles données pour les tendances
        setAllSales,
        loading,
        error,
        fetchProducts,
        fetchSales,
        fetchAllSales, // Nouvelle fonction
        addProduct,
        updateProduct,
        addSale,
        updateSale,
        deleteSale,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
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
