import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Sale, Product } from '@/types';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import { PlusCircle, FileText, ShoppingCart, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
    isLoading: appLoading,
    fetchSales,
    fetchProducts,
    exportMonth
  } = useApp();

  const { toast } = useToast();

  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>(undefined);
  const [showProductsList, setShowProductsList] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoadError(null);
      try {
        await Promise.all([fetchProducts(), fetchSales()]);
      } catch (error) {
        console.error("Erreur de chargement :", error);
        setLoadError("Impossible de charger les données.");
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    };
    loadData();
  }, [fetchProducts, fetchSales, toast]);

  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalProductsSold = sales.reduce((sum, sale) => sum + (sale.quantitySold || 0), 0);
  const availableProducts = products.filter(p => p.quantity > 0);
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setAddSaleDialogOpen(true);
  };

  const handleExportMonth = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir exporter les ventes de ce mois ?"
    );
    if (!confirmed) return;

    const doc = new jsPDF();
    doc.text(`Rapport de ventes – ${monthNames[currentMonth]} ${currentYear}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Produit', 'Quantité', 'Prix Unitaire (€)', 'Total (€)', 'Bénéfice (€)']],
      body: sales.map(sale => {
        const unitPrice = typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0;
        const quantity = typeof sale.quantitySold === 'number' ? sale.quantitySold : 0;
        const profit = typeof sale.profit === 'number' ? sale.profit : 0;

        return [
          new Date(sale.date).toLocaleDateString('fr-FR'),
          sale.description || 'Inconnu',
          quantity,
          unitPrice.toFixed(2),
          (quantity * unitPrice).toFixed(2),
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total des bénéfices" description="Du mois en cours" value={totalProfit} color="text-app-green" currency />
          <StatCard title="Produits vendus" description="Nombre total d'unités" value={totalProductsSold} color="text-app-blue" />
          <StatCard title="Produits disponibles" description="Dans l'inventaire" value={availableProducts.length} color="text-app-purple" />
          <StatCard title="Stock total" description="Toutes unités confondues" value={totalStock} color="text-gray-700" />
        </div>

        {/* Actions et table */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold">Ventes du mois</h2>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button onClick={() => setAddProductDialogOpen(true)} className="bg-app-red hover:bg-opacity-90">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
            </Button>
            <Button onClick={() => setEditProductDialogOpen(true)} className="bg-app-blue hover:bg-opacity-90">
              <Edit className="mr-2 h-4 w-4" /> Modifier un produit
            </Button>
            <Button onClick={() => { setSelectedSale(undefined); setAddSaleDialogOpen(true); }} className="bg-app-green hover:bg-opacity-90">
              <ShoppingCart className="mr-2 h-4 w-4" /> Ajouter une vente
            </Button>
          </div>
        </div>

        <SalesTable sales={sales} onRowClick={handleRowClick} />

        {/* Dialogues */}
        {addSaleDialogOpen && (
          <AddSaleForm
            isOpen={addSaleDialogOpen}
            onClose={() => { setAddSaleDialogOpen(false); setSelectedSale(undefined); }}
            editSale={selectedSale}
          />
        )}
        {addProductDialogOpen && (
          <AddProductForm isOpen={addProductDialogOpen} onClose={() => setAddProductDialogOpen(false)} />
        )}
        {editProductDialogOpen && (
          <EditProductForm isOpen={editProductDialogOpen} onClose={() => setEditProductDialogOpen(false)} />
        )}

        <Dialog open={showProductsList} onOpenChange={setShowProductsList}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Produits disponibles</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 p-4">
                {availableProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{product.description}</p>
                      <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.purchasePrice)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

const StatCard = ({
  title,
  description,
  value,
  color,
  currency = false,
}: {
  title: string;
  description: string;
  value: number;
  color: string;
  currency?: boolean;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className={`text-3xl font-bold ${color}`}>
        {currency
          ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
          : value}
      </p>
    </CardContent>
  </Card>
);

export default DashboardPage;
