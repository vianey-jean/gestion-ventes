
import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sale } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import ExportSalesDialog from '@/components/dashboard/ExportSalesDialog';
import InvoiceGenerator from '@/components/dashboard/InvoiceGenerator';
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import { PlusCircle, Edit, ShoppingCart, Loader2, FileText, TrendingUp, Package, Warehouse, BarChart3, Receipt, Activity, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
 * Composant principal pour la gestion des ventes de produits avec tableau de bord avancé
 */
const VentesProduits: React.FC = () => {
  const { 
    sales, 
    products, 
    isLoading: appLoading,
    fetchSales, 
    fetchProducts,
    currentMonth,
    currentYear
  } = useApp();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();
  
  // États pour gérer les dialogues
  const [addSaleDialogOpen, setAddSaleDialogOpen] = React.useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = React.useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [invoiceGeneratorOpen, setInvoiceGeneratorOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | undefined>(undefined);
  const [showProductsList, setShowProductsList] = React.useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sales');

  const filteredSales = sales;
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalProductsSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const availableProducts = products.filter(p => p.quantity > 0);
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      console.log('User not authenticated, not loading data');
      return;
    }

    const loadData = async () => {
      setLoadError(null);
      
      try {
        console.log(`Loading data for current month ${currentMonth}, year ${currentYear}`);
        await Promise.all([
          fetchProducts(),
          fetchSales()
        ]);
        
        console.log(`Loaded sales for current month ${currentMonth}, year ${currentYear}`);
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
  }, [fetchProducts, fetchSales, toast, isAuthenticated, authLoading, currentMonth, currentYear]);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-lg text-gray-600 dark:text-gray-300">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };

  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Navigation par onglets modernisée */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2">
          <TabsTrigger 
            value="sales" 
            className="group relative flex items-center gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden font-bold text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 group-data-[state=active]:bg-white/20 shadow-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="font-black">Gestion des Ventes Premium</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="advanced" 
            className="group relative flex items-center gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden font-bold text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-data-[state=active]:bg-white/20 shadow-lg">
                <Crown className="h-5 w-5" />
              </div>
              <span className="font-black">Tableau de Bord Executive</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-8">
          {/* Statistiques modernisées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernContainer gradient="green" className="transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Bénéfices du mois</p>
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
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Produits vendus ce mois</p>
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
            title="Ventes du mois en cours" 
            icon={ShoppingCart}
            gradient="neutral"
            headerActions={
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Mois en cours</p>
                  <p className="text-lg font-bold text-app-red">
                    {monthNames[currentMonth - 1]} {currentYear}
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

              <ModernActionButton
                icon={Receipt}
                onClick={() => setInvoiceGeneratorOpen(true)}
                gradient="purple"
                buttonSize="md"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
              >
                Générer facture
              </ModernActionButton>
            </div>
            
            {/* Indicateur de chargement modernisé */}
            {(appLoading || authLoading) && (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-lg text-gray-600 dark:text-gray-300">Chargement des données du mois en cours...</p>
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
            
            {/* Message informatif */}
            <div className="text-sm text-gray-500 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium text-blue-700 dark:text-blue-300">
                📅 Affichage automatique du mois en cours: {monthNames[currentMonth - 1]} {currentYear}
              </p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Les données se mettront automatiquement à jour le 1er du mois prochain.
              </p>
            </div>
          </ModernContainer>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedDashboard />
        </TabsContent>
      </Tabs>
      
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
      
      <ExportSalesDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />

      <InvoiceGenerator
        isOpen={invoiceGeneratorOpen}
        onClose={() => setInvoiceGeneratorOpen(false)}
      />
      
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
