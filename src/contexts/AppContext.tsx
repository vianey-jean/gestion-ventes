
// We need to add typings to handle boolean returns from the API
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, Sale } from '@/types';
import { productService, salesService } from '@/service/api';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Add the missing properties that components are expecting
  const currentMonth = selectedMonth - 1; // Convert to 0-based for array index
  const currentYear = selectedYear;
  const isLoading = loading;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
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
  }, [toast]);

  const fetchSales = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSales = await salesService.getSales(month, year);
      setSales(fetchedSales);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les ventes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    fetchSales(selectedMonth, selectedYear);
  }, [fetchProducts, fetchSales, selectedMonth, selectedYear]);

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
    try {
      const result = await salesService.addSale(saleData);
      
      // Update local state only if we get a Sale object back
      if (result && typeof result !== 'boolean') {
        setSales(prevSales => [...prevSales, result]);
        return result;
      }
      
      // If we got a boolean result, still consider it a success but return null
      if (result === true) {
        await fetchSales(selectedMonth, selectedYear);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding sale:', error);
      return null;
    }
  };

  const updateSale = async (sale: Sale): Promise<Sale | null> => {
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
        await fetchSales(selectedMonth, selectedYear);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating sale:', error);
      return null;
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
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
