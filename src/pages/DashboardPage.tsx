
import React, { useState } from 'react';
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
        {/* En-tête de la page - Now centered */}
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl font-bold mb-6 text-app-purple">Tableau de bord</h1>
        </div>

        <Tabs defaultValue="ventes" onValueChange={setActiveTab} className="space-y-8">
          <div className={cn(
            "tabs-header bg-white dark:bg-sidebar rounded-xl shadow-lg p-4",
            isMobile && "pt-5 pb-[180px]" // Added padding top and bottom only on mobile
          )}>
            <TabsList className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-4'} w-full`}>
              <TabsTrigger 
                value="ventes" 
                className={cn(
                  "font-bold uppercase flex items-center justify-center gap-2 tab-3d py-3",
                  activeTab === "ventes" 
                    ? "text-white bg-gradient-to-r from-app-purple to-app-dark-purple" 
                    : "text-app-purple hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className={isMobile ? "text-sm" : ""}>VENTES PRODUITS</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="pret-familles" 
                className={cn(
                  "font-bold uppercase flex items-center justify-center gap-2 tab-3d py-3",
                  activeTab === "pret-familles" 
                    ? "text-white bg-gradient-to-r from-app-purple to-app-dark-purple" 
                    : "text-app-purple hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Users className="h-4 w-4" />
                <span className={isMobile ? "text-sm" : ""}>PRÊT FAMILLES</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="pret-produits" 
                className={cn(
                  "font-bold uppercase flex items-center justify-center gap-2 tab-3d py-3",
                  activeTab === "pret-produits" 
                    ? "text-white bg-gradient-to-r from-app-purple to-app-dark-purple" 
                    : "text-app-purple hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Package className="h-4 w-4" />
                <span className={isMobile ? "text-sm" : ""}>PRÊT PRODUITS</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="depenses" 
                className={cn(
                  "font-bold uppercase flex items-center justify-center gap-2 tab-3d py-3",
                  activeTab === "depenses" 
                    ? "text-white bg-gradient-to-r from-app-purple to-app-dark-purple" 
                    : "text-app-purple hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span className={isMobile ? "text-sm" : ""}>DÉPENSES DU MOIS</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="tabs-content bg-white dark:bg-sidebar-accent rounded-xl shadow-lg p-4 sm:p-6">
            <TabsContent value="ventes" className="mt-0 animate-in fade-in-50">
              <VentesProduits />
            </TabsContent>
            
            <TabsContent value="pret-familles" className="mt-0 animate-in fade-in-50">
              <PretFamilles />
            </TabsContent>
            
            <TabsContent value="pret-produits" className="mt-0 animate-in fade-in-50">
              <PretProduits />
            </TabsContent>
            
            <TabsContent value="depenses" className="mt-0 animate-in fade-in-50">
              <DepenseDuMois />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
