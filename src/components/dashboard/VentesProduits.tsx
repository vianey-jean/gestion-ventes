
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import { PlusCircle, Edit, ShoppingCart, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

 // Noms des mois en français
 const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];


const VentesProduits: React.FC = () => {
  // Récupérer les données et fonctions du contexte
  const { 
    currentMonth,
    currentYear, 
    sales, 
    products, 
    isLoading: appLoading,
    fetchSales, 
    exportMonth,
    fetchProducts,
  } = useApp();
  const { toast } = useToast();
  
  // États pour gérer les dialogues
  const [addSaleDialogOpen, setAddSaleDialogOpen] = React.useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = React.useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | undefined>(undefined);
  const [showProductsList, setShowProductsList] = React.useState(false);

  // Calcul des statistiques
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalProductsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const availableProducts = products.filter(p => p.quantity > 0);
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Gestion du clic sur une ligne du tableau des ventes
  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };

    // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      setLoadError(null);
      
      try {
        // Charger les produits et les ventes en parallèle
        await Promise.all([fetchProducts(), fetchSales()]);
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



  const handleExportMonth = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir exporter les ventes de ce mois ?"
    );
    if (!confirmed) return;

    const doc = new jsPDF();
    doc.text(`Rapport de ventes – ${monthNames[currentMonth]} ${currentYear}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Produit' , 'Prix Achat (€)' , 'Quantité', 'Prix Vendu (€)', 'Bénéfice (€)']],
      body: sales.map(sale => {
        const achatPrice = typeof sale.purchasePrice=== 'number' ? sale.purchasePrice : 0;
        const quantity = typeof sale.quantitySold === 'number' ? sale.quantitySold : 0;
        const ventePrice = typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0;
        const profit = typeof sale.profit === 'number' ? sale.profit : 0;

        return [
          new Date(sale.date).toLocaleDateString('fr-FR'),
          sale.description || 'Inconnu',
          achatPrice.toFixed(2),
          quantity,
          ventePrice.toFixed(2),
          profit.toFixed(2),
        ];
      }),
    });

    doc.save(`ventes_${monthNames[currentMonth]}_${currentYear}.pdf`);

    const success = await exportMonth();
    if (success) {
      toast({
        title: "Export réussi",
        description: "PDF téléchargé et ventes réinitialisées pour le mois prochain.",
        className: "notification-success",
      });
    }
  }
    

  return (
    <div className="mt-6">
      {/* Affichage des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className='card-3d'>
          <CardHeader className="pb-2 ">
            <CardTitle className="text-lg">Total des bénéfices</CardTitle>
            <CardDescription>Du mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-green">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalProfit)}
            </p>
          </CardContent>
        </Card>
        
        <Card className='card-3d'>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Produits vendus</CardTitle>
            <CardDescription>Nombre total d'unités</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-blue">{totalProductsSold}</p>
          </CardContent>
        </Card>
        
        <Card className='card-3d'>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Produits disponibles</CardTitle>
            <CardDescription>Dans l'inventaire</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-purple">{availableProducts.length}</p>
          </CardContent>
        </Card>
        
        <Card className='card-3d'>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Stock total</CardTitle>
            <CardDescription>Toutes unités confondues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">{totalStock}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold ">Ventes du mois</h2>
        <div className="mt-4 sm:mt-0 flex items-center">
            <h2 className="text-xl font-bold text-app-red mr-4">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button
              onClick={handleExportMonth}
              variant="outline"
              className="flex items-center border-gray-300 mr-2 card-3d"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button
            onClick={() => setAddProductDialogOpen(true)}
            className="bg-app-red hover:bg-opacity-90 card-3d"
          >
            <PlusCircle className="mr-2 h-4 w-4 " />
            Ajouter un produit
          </Button>
          
          <Button
            onClick={() => setEditProductDialogOpen(true)}
            className="bg-app-blue hover:bg-opacity-90 card-3d"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier un produit
          </Button>
          
          <Button
            onClick={() => {
              setSelectedSale(undefined);
              setAddSaleDialogOpen(true);
            }}
            className="bg-app-green hover:bg-opacity-90 card-3d"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter une vente
          </Button>
        </div>
      </div>
      
      {/* Tableau des ventes avec indicateur de chargement */}
      {appLoading ? (
        <div className="flex justify-center items-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-app-blue mr-2" />
          <p>Chargement des données...</p>
        </div>
      ) : null}
      
      {/* Tableau des ventes */}
      <SalesTable 
        sales={sales} 
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
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                      .format(product.purchasePrice)}
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
