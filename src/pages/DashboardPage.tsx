
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Hero Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-purple-200 dark:border-purple-800">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Tableau de bord en temps réel</span>
              <span className="xs:hidden">Temps réel</span>
            </div>
            
                <motion.h1
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                            bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                            bg-[length:200%_200%] animate-gradient 
                            bg-clip-text text-transparent mb-4 sm:mb-6 text-center text-3d px-2"
                >
                  Tableau de bord
                </motion.h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Gérez efficacement vos ventes, inventaires et finances en un seul endroit
            </p>
          </div>

          <Tabs defaultValue="ventes" onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Modern Tab Navigation */}
            <div className={cn(
              "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 border border-white/20",
              isMobile && "pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-12"
            )}>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-3xl"></div>
              
              <TabsList className={cn(
                "relative grid w-full h-auto p-1.5 sm:p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20",
                "grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-2"
              )}>
                <TabsTrigger 
                  value="ventes" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "ventes" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <ShoppingCart className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Ventes<span className="hidden sm:inline"> Produits</span></span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pret-familles" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "pret-familles" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Users className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Prêt<span className="hidden sm:inline"> Familles</span></span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pret-produits" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "pret-produits" 
                      ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Package className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Prêt<span className="hidden sm:inline"> Produits</span></span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="depenses" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "depenses" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <CreditCard className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Dépenses<span className="hidden md:inline"> du Mois</span></span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="inventaire" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "inventaire" 
                      ? "text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Archive className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Inventaire</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="calcul-benefice" 
                  className={cn(
                    "font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105",
                    activeTab === "calcul-benefice" 
                      ? "text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Calculator className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-center leading-tight">Calcul<span className="hidden md:inline"> Bénéfice</span></span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Content Area */}
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Content background decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative p-3 sm:p-4 md:p-6 lg:p-8">
                <TabsContent value="ventes" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Ventes & Produits</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gérez vos ventes et votre inventaire</p>
                    </div>
                  </div>
                  <VentesProduits />
                </TabsContent>
                
                <TabsContent value="pret-familles" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Prêts aux Familles</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Suivi des prêts et remboursements familiaux</p>
                    </div>
                  </div>
                  <PretFamilles />
                </TabsContent>
                
                <TabsContent value="pret-produits" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Prêts de Produits</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gestion des produits prêtés</p>
                    </div>
                  </div>
                  <PretProduits />
                </TabsContent>
                
                <TabsContent value="depenses" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Dépenses Mensuelles</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Suivi et contrôle de vos dépenses</p>
                    </div>
                  </div>
                  <DepenseDuMois />
                </TabsContent>
                
                <TabsContent value="inventaire" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Inventaire des Produits</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gestion complète de votre stock</p>
                    </div>
                  </div>
                  <Inventaire />
                </TabsContent>
                
                <TabsContent value="calcul-benefice" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Calcul de Bénéfices</h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Calculez vos marges et prix de vente optimaux</p>
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
