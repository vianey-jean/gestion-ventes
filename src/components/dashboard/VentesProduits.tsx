
import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sale } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import ExportSalesDialog from '@/components/dashboard/ExportSalesDialog';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import { PlusCircle, Edit, ShoppingCart, Loader2, FileText, TrendingUp, Package, Warehouse, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/dashboard/StatCard';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

/**
 * Noms des mois en français pour l'affichage
 */
const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

/**
 * Composant principal pour la gestion des ventes de produits - Version modernisée
 */
const VentesProduits: React.FC = () => {
  // Récupérer les données et fonctions du contexte
  const { 
    sales, 
    products, 
    isLoading: appLoading,
    fetchSales, 
    fetchProducts,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear
  } = useApp();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();
  
  // États pour gérer les dialogues
  const [addSaleDialogOpen, setAddSaleDialogOpen] = React.useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = React.useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | undefined>(undefined);
  const [showProductsList, setShowProductsList] = React.useState(false);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Calcul des statistiques basés sur les ventes filtrées
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalProductsSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const availableProducts = products.filter(p => p.quantity > 0);
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);

  // Filtrer les ventes pour le mois et l'année sélectionnés
  useEffect(() => {
    // Assurez-vous de filtrer les ventes pour n'afficher que celles du mois et de l'année sélectionnés
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-based index (0 = Janvier)
    const currentYearValue = currentDate.getFullYear();
    
    // Définir le mois et l'année actuels si nécessaire
    if (selectedMonth !== currentMonthIndex + 1) {
      setSelectedMonth(currentMonthIndex + 1);
    }
    
    if (selectedYear !== currentYearValue) {
      setSelectedYear(currentYearValue);
    }
    
    // Filtrer les ventes pour le mois en cours
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      // saleDate.getMonth() retourne 0-11, selectedMonth est 1-12
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    });
    
    setFilteredSales(filtered);
    
    console.log(`Filtered sales for month ${selectedMonth}, year ${selectedYear}: ${filtered.length} sales`);
  }, [sales, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear]);

  // Charger les données au montage du composant seulement si authentifié
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      console.log('User not authenticated, not loading data');
      return;
    }

    const loadData = async () => {
      setLoadError(null);
      
      try {
        // Charger les produits et les ventes en parallèle
        // S'assurer que les ventes sont chargées pour le mois en cours
        const currentDate = new Date();
        const currentMonthNum = currentDate.getMonth() + 1; // Convertir de 0-11 à 1-12
        const currentYearNum = currentDate.getFullYear();
        
        await Promise.all([
          fetchProducts(),
          fetchSales(currentMonthNum, currentYearNum)
        ]);
        
        console.log(`Loaded sales for month ${currentMonthNum}, year ${currentYearNum}`);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadError("Impossible de charger les données. Veuillez réessayer.");
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    };
    
    loadData();
  }, [fetchProducts, fetchSales, toast, isAuthenticated, authLoading]);

  // Si l'utilisateur n'est pas authentifié, afficher un message
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-lg text-gray-600 dark:text-gray-300">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Gestion du clic sur une ligne du tableau des ventes
  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };

  // Ouverture du dialogue d'exportation
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Statistiques modernisées avec des cartes élégantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernContainer gradient="green" className="transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Bénéfices totaux</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatEuro(totalProfit)}</p>
            </div>
          </div>
        </ModernContainer>
        
        <ModernContainer gradient="blue" className="transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Produits vendus</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalProductsSold}</p>
            </div>
          </div>
        </ModernContainer>
        
        <ModernContainer gradient="purple" className="transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Produits disponibles</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{availableProducts.length}</p>
            </div>
          </div>
        </ModernContainer>
        
        <ModernContainer gradient="orange" className="transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <Warehouse className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Stock total</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalStock}</p>
            </div>
          </div>
        </ModernContainer>
      </div>
      
      {/* Conteneur principal modernisé */}
      <ModernContainer 
        title="Gestion des ventes" 
        icon={ShoppingCart}
        gradient="neutral"
        headerActions={
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Période actuelle</p>
              <p className="text-lg font-bold text-app-red">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <ModernActionButton
              icon={FileText}
              onClick={handleOpenExportDialog}
              variant="outline"
              gradient="indigo"
              buttonSize="md"
            >
              Exporter
            </ModernActionButton>
          </div>
        }
      >
        {/* Boutons d'action modernisés */}
        <div className="flex flex-wrap gap-4 mb-8">
          <ModernActionButton
            icon={PlusCircle}
            onClick={() => setAddProductDialogOpen(true)}
            gradient="red"
            buttonSize="md"
          >
            Ajouter un produit
          </ModernActionButton>
          
          <ModernActionButton
            icon={Edit}
            onClick={() => setEditProductDialogOpen(true)}
            gradient="blue"
            buttonSize="md"
          >
            Modifier un produit
          </ModernActionButton>
          
          <ModernActionButton
            icon={ShoppingCart}
            onClick={() => {
              setSelectedSale(undefined);
              setAddSaleDialogOpen(true);
            }}
            gradient="green"
            buttonSize="md"
          >
            Ajouter une vente
          </ModernActionButton>
        </div>
        
        {/* Indicateur de chargement modernisé */}
        {(appLoading || authLoading) && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Chargement des données...</p>
            </div>
          </div>
        )}
        
        {/* Tableau des ventes */}
        {!appLoading && !authLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <SalesTable 
              sales={filteredSales} 
              onRowClick={handleRowClick} 
            />
          </div>
        )}
      </ModernContainer>
      
      {/* Formulaires dans des dialogues */}
      {addSaleDialogOpen && (
        <AddSaleForm 
          isOpen={addSaleDialogOpen} 
          onClose={() => {
            setAddSaleDialogOpen(false);
            setSelectedSale(undefined);
          }} 
          editSale={selectedSale}
        />
      )}
      
      {addProductDialogOpen && (
        <AddProductForm 
          isOpen={addProductDialogOpen} 
          onClose={() => setAddProductDialogOpen(false)} 
        />
      )}
      
      {editProductDialogOpen && (
        <EditProductForm
          isOpen={editProductDialogOpen}
          onClose={() => setEditProductDialogOpen(false)}
        />
      )}
      
      {/* Dialogue d'exportation des ventes */}
      <ExportSalesDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
      
      {/* Liste des produits disponibles */}
      <Dialog open={showProductsList} onOpenChange={setShowProductsList}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Produits disponibles</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 p-4">
              {availableProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{product.description}</p>
                    <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {formatEuro(product.purchasePrice)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VentesProduits;
