import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import VentesProduits from '@/components/dashboard/VentesProduits';
import PretFamilles from '@/components/dashboard/PretFamilles';
import PretProduits from '@/components/dashboard/PretProduits';
import DepenseDuMois from '@/components/dashboard/DepenseDuMois';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('ventes');

  return (
    <Layout requireAuth>
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

      <Tabs defaultValue="ventes" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger 
            value="ventes" 
            className={cn(
              "font-bold text-app-purple uppercase",
              activeTab === "ventes" ? "text-app-purple" : ""
            )}
          >
            VENTES PRODUITS
          </TabsTrigger>
          <TabsTrigger 
            value="pret-familles" 
            className={cn(
              "font-bold text-app-purple uppercase",
              activeTab === "pret-familles" ? "text-app-purple" : ""
            )}
          >
            PRÊT FAMILLES
          </TabsTrigger>
          <TabsTrigger 
            value="pret-produits" 
            className={cn(
              "font-bold text-app-purple uppercase",
              activeTab === "pret-produits" ? "text-app-purple" : ""
            )}
          >
            PRÊT PRODUITS
          </TabsTrigger>
          <TabsTrigger 
            value="depenses" 
            className={cn(
              "font-bold text-app-purple uppercase",
              activeTab === "depenses" ? "text-app-purple" : ""
            )}
          >
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
