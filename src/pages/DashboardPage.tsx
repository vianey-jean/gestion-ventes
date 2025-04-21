
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VentesProduits from '@/components/dashboard/VentesProduits';
import PretFamilles from '@/components/dashboard/PretFamilles';
import PretProduits from '@/components/dashboard/PretProduits';
import DepenseDuMois from '@/components/dashboard/DepenseDuMois';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Page principale du tableau de bord
 */
const DashboardPage: React.FC = () => {
  // Récupérer les données et fonctions du contexte
  const { 
    currentMonth, 
    currentYear, 
    isLoading: appLoading, 
    fetchSales, 
    fetchProducts,
    exportMonth
  } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ventes");
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Noms des mois en français
  const monthNames = [
    'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
  ];

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

  // Gestion de l'export du mois
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
        {/* En-tête de la page */}
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
        
        {/* Système d'onglets pour les différentes sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="ventes" className="font-bold text-purple-700 uppercase">VENTES PRODUITS</TabsTrigger>
            <TabsTrigger value="pret-familles" className="font-bold text-purple-700 uppercase">PRÊT FAMILLES</TabsTrigger>
            <TabsTrigger value="pret-produits" className="font-bold text-purple-700 uppercase">PRÊT PRODUITS</TabsTrigger>
            <TabsTrigger value="depenses" className="font-bold text-purple-700 uppercase">DÉPENSES DU MOIS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ventes">
            <VentesProduits />
          </TabsContent>
          
          <TabsContent value="pret-familles">
            <PretFamilles />
          </TabsContent>
          
          <TabsContent value="pret-produits">
            <PretProduits />
          </TabsContent>
          
          <TabsContent value="depenses">
            <DepenseDuMois />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
