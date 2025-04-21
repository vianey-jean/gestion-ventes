
import React from 'react';
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

const VentesProduits: React.FC = () => {
  // Récupérer les données et fonctions du contexte
  const { 
    sales, 
    products, 
    isLoading: appLoading
  } = useApp();
  
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

  // Gestion du clic sur une ligne du tableau des ventes
  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };

  return (
    <div className="mt-6">
      {/* Affichage des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total des bénéfices</CardTitle>
            <CardDescription>Du mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-green">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalProfit)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Produits vendus</CardTitle>
            <CardDescription>Nombre total d'unités</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-blue">{totalProductsSold}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Produits disponibles</CardTitle>
            <CardDescription>Dans l'inventaire</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-app-purple">{availableProducts.length}</p>
          </CardContent>
        </Card>
        
        <Card>
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
        <h2 className="text-2xl font-bold">Ventes du mois</h2>
        
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button
            onClick={() => setAddProductDialogOpen(true)}
            className="bg-app-red hover:bg-opacity-90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
          
          <Button
            onClick={() => setEditProductDialogOpen(true)}
            className="bg-app-blue hover:bg-opacity-90"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier un produit
          </Button>
          
          <Button
            onClick={() => {
              setSelectedSale(undefined);
              setAddSaleDialogOpen(true);
            }}
            className="bg-app-green hover:bg-opacity-90"
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
