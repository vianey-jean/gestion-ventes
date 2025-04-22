
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VentesProduits from '@/components/dashboard/VentesProduits';
import PretFamilles from '@/components/dashboard/PretFamilles';
import PretProduits from '@/components/dashboard/PretProduits';
import DepenseDuMois from '@/components/dashboard/DepenseDuMois';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingCart, Users, Package, CreditCard } from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('ventes');
  const isMobile = useIsMobile();

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
        </div>

        <Tabs defaultValue="ventes" onValueChange={setActiveTab}>
          <TabsList className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-4'} mb-6`}>
            <TabsTrigger 
              value="ventes" 
              className={cn(
                "font-bold text-app-purple uppercase flex items-center justify-center gap-2",
                activeTab === "ventes" ? "text-app-purple" : ""
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              VENTES PRODUITS
            </TabsTrigger>
            <TabsTrigger 
              value="pret-familles" 
              className={cn(
                "font-bold text-app-purple uppercase flex items-center justify-center gap-2",
                activeTab === "pret-familles" ? "text-app-purple" : ""
              )}
            >
              <Users className="h-4 w-4" />
              PRÊT FAMILLES
            </TabsTrigger>
            <TabsTrigger 
              value="pret-produits" 
              className={cn(
                "font-bold text-app-purple uppercase flex items-center justify-center gap-2",
                activeTab === "pret-produits" ? "text-app-purple" : ""
              )}
            >
              <Package className="h-4 w-4" />
              PRÊT PRODUITS
            </TabsTrigger>
            <TabsTrigger 
              value="depenses" 
              className={cn(
                "font-bold text-app-purple uppercase flex items-center justify-center gap-2",
                activeTab === "depenses" ? "text-app-purple" : ""
              )}
            >
              <CreditCard className="h-4 w-4" />
              DÉPENSES DU MOIS
            </TabsTrigger>
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
