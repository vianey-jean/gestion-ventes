
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VentesProduits from '@/components/dashboard/VentesProduits';
import PretFamilles from '@/components/dashboard/PretFamilles';
import PretProduits from '@/components/dashboard/PretProduits';
import DepenseDuMois from '@/components/dashboard/DepenseDuMois';
import Inventaire from '@/components/dashboard/Inventaire';
import ProfitCalculator from '@/components/dashboard/ProfitCalculator';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from "framer-motion";
import { ShoppingCart, Users, Package, CreditCard, TrendingUp, Sparkles, Archive, Calculator } from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('ventes');
  const isMobile = useIsMobile();

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tableau de bord en temps réel
            </div>
            
                <motion.h1
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}   // Apparition douce avec léger zoom
                  animate={{ opacity: 1, y: 0, scale: 1 }}      // Monte + grossit légèrement
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="text-5xl md:text-6xl font-extrabold 
                            bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                            bg-[length:200%_200%] animate-gradient 
                            bg-clip-text text-transparent mb-6 text-center text-3d"
                >
                  Tableau de bord
                </motion.h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Gérez efficacement vos ventes, inventaires et finances en un seul endroit
            </p>
          </div>

          <Tabs defaultValue="ventes" onValueChange={setActiveTab} className="space-y-8">
            {/* Modern Tab Navigation */}
            <div className={cn(
              "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20",
              isMobile && "pt-8 pb-12"
            )}>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-3xl"></div>
              
              <TabsList className={cn(
                "relative grid w-full h-auto p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/20",
                isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-6 gap-2'
              )}>
                <TabsTrigger 
                  value="ventes" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "ventes" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Ventes Produits</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pret-familles" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "pret-familles" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Users className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Prêt Familles</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pret-produits" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "pret-produits" 
                      ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Package className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Prêt Produits</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="depenses" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "depenses" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Dépenses du Mois</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="inventaire" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "inventaire" 
                      ? "text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Archive className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Inventaire</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="calcul-benefice" 
                  className={cn(
                    "font-bold text-sm uppercase flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "calcul-benefice" 
                      ? "text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Calculator className="h-5 w-5" />
                  <span className={isMobile ? "text-xs" : "text-sm"}>Calcul Bénéfice</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Content Area */}
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Content background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative p-8">
                <TabsContent value="ventes" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ventes & Produits</h2>
                      <p className="text-gray-600 dark:text-gray-300">Gérez vos ventes et votre inventaire</p>
                    </div>
                  </div>
                  <VentesProduits />
                </TabsContent>
                
                <TabsContent value="pret-familles" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prêts aux Familles</h2>
                      <p className="text-gray-600 dark:text-gray-300">Suivi des prêts et remboursements familiaux</p>
                    </div>
                  </div>
                  <PretFamilles />
                </TabsContent>
                
                <TabsContent value="pret-produits" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prêts de Produits</h2>
                      <p className="text-gray-600 dark:text-gray-300">Gestion des produits prêtés</p>
                    </div>
                  </div>
                  <PretProduits />
                </TabsContent>
                
                <TabsContent value="depenses" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dépenses Mensuelles</h2>
                      <p className="text-gray-600 dark:text-gray-300">Suivi et contrôle de vos dépenses</p>
                    </div>
                  </div>
                  <DepenseDuMois />
                </TabsContent>
                
                <TabsContent value="inventaire" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Archive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventaire des Produits</h2>
                      <p className="text-gray-600 dark:text-gray-300">Gestion complète de votre stock</p>
                    </div>
                  </div>
                  <Inventaire />
                </TabsContent>
                
                <TabsContent value="calcul-benefice" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calcul de Bénéfices</h2>
                      <p className="text-gray-600 dark:text-gray-300">Calculez vos marges et prix de vente optimaux</p>
                    </div>
                  </div>
                  <ProfitCalculator />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
