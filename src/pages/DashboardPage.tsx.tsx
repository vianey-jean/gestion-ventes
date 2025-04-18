
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditproductForm';
import { PlusCircle, FileText, ShoppingCart, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const DashboardPage: React.FC = () => {
  const { 
    sales, 
    products, 
    currentMonth, 
    currentYear, 
    isLoading, 
    fetchSales, 
    fetchProducts,
    exportMonth
  } = useApp();
  const { toast } = useToast();
  
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>(undefined);
  
  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);
  
  // Calculate total profit
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  
  // Calculate total products sold
  const totalProductsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  
  // Calculate available products (products with quantity > 0)
  const availableProducts = products.filter(product => product.quantity > 0).length;
  
  // Calculate total stock (sum of all product quantities)
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  
  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };
  
  const handleExportMonth = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir exporter les ventes de ce mois ? Cette action va générer un PDF et réinitialiser le tableau des ventes pour le mois prochain."
    );
    
    if (confirmed) {
      const success = await exportMonth();
      if (success) {
        toast({
          title: "Export réussi",
          description: "Les ventes ont été exportées et réinitialisées pour le mois prochain",
          className: "notification-success",
        });
      }
    }
  };
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-gray-500">Gérez vos ventes et votre inventaire</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <h2 className="text-xl font-bold text-app-red mr-4">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button
              onClick={handleExportMonth}
              variant="outline"
              className="flex items-center border-gray-300 mr-2"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
        
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
              <p className="text-3xl font-bold text-app-purple">{availableProducts}</p>
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold">Ventes du mois</h2>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
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
        
      
          <SalesTable 
            sales={sales} 
            onRowClick={handleRowClick} 
          />
       
        
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
      </div>
    </Layout>
  );
};

export default DashboardPage;
