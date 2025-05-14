
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import ExportSalesDialog from '@/components/dashboard/ExportSalesDialog';
import { PlusCircle, Edit, ShoppingCart, Loader2, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/dashboard/StatCard';
import ActionButton from '@/components/dashboard/ActionButton';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

/**
 * Noms des mois en français pour l'affichage
 */
const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

/**
 * Composant principal pour la gestion des ventes de produits
 * Affiche les statistiques, la liste des ventes, et permet d'ajouter/modifier des ventes et produits
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

  // Charger les données au montage du composant
  useEffect(() => {
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
  }, [fetchProducts, fetchSales, toast]);

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
    <div className="mt-6">
      {/* Affichage des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total des bénéfices"
          description="Du mois en cours"
          value={formatEuro(totalProfit)}
          valueClassName="text-app-green"
        />
        
        <StatCard 
          title="Produits vendus"
          description="Nombre total d'unités"
          value={totalProductsSold}
          valueClassName="text-app-blue"
        />
        
        <StatCard 
          title="Produits disponibles"
          description="Dans l'inventaire"
          value={availableProducts.length}
          valueClassName="text-app-purple"
        />
        
        <StatCard 
          title="Stock total"
          description="Toutes unités confondues"
          value={totalStock}
          valueClassName="text-gray-700"
        />
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Ventes du mois</h2>
        <div className="mt-4 sm:mt-0 flex items-center">
          <h2 className="text-xl font-bold text-app-red mr-4">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
          <ActionButton
            icon={FileText}
            onClick={handleOpenExportDialog}
            variant="outline"
            className="border-gray-300 mr-2"
          >
            Exporter
          </ActionButton>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <ActionButton
            icon={PlusCircle}
            onClick={() => setAddProductDialogOpen(true)}
            className="bg-app-red hover:bg-opacity-90"
          >
            Ajouter un produit
          </ActionButton>
          
          <ActionButton
            icon={Edit}
            onClick={() => setEditProductDialogOpen(true)}
            className="bg-app-blue hover:bg-opacity-90"
          >
            Modifier un produit
          </ActionButton>
          
          <ActionButton
            icon={ShoppingCart}
            onClick={() => {
              setSelectedSale(undefined);
              setAddSaleDialogOpen(true);
            }}
            className="bg-app-green hover:bg-opacity-90"
          >
            Ajouter une vente
          </ActionButton>
        </div>
      </div>
      
      {/* Indicateur de chargement */}
      {appLoading && (
        <div className="flex justify-center items-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-app-blue mr-2" />
          <p>Chargement des données...</p>
        </div>
      )}
      
      {/* Tableau des ventes */}
      <SalesTable 
        sales={filteredSales} 
        onRowClick={handleRowClick} 
      />
      
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
