
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
import { 
  ShoppingCart, 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp, 
  Sparkles, 
  Archive, 
  Calculator,
  Crown,
  Gem,
  Diamond,
  Award,
  Zap,
  Star
} from 'lucide-react';

/**
 * DashboardPage - Page principale du tableau de bord
 * Design moderne et luxueux avec icônes premium
 */
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('ventes');
  const isMobile = useIsMobile();

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/60 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Hero Header Premium */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 backdrop-blur-xl rounded-full text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-purple-300/30 dark:border-purple-700/30 shadow-xl shadow-purple-500/10"
            >
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500 animate-pulse" />
              <span className="hidden xs:inline">Tableau de bord Premium en temps réel</span>
              <span className="xs:hidden">Dashboard Premium</span>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-pink-500" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                        bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                        bg-[length:200%_200%] animate-gradient 
                        bg-clip-text text-transparent mb-4 sm:mb-6 text-center text-3d px-2"
            >
              <Diamond className="inline h-8 w-8 sm:h-10 sm:w-10 mr-2 text-purple-500" />
              Tableau de Bord
              <Gem className="inline h-8 w-8 sm:h-10 sm:w-10 ml-2 text-pink-500" />
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 flex items-center justify-center gap-2"
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Gérez efficacement vos ventes, inventaires et finances en un seul endroit
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </motion.p>
          </div>

          <Tabs defaultValue="ventes" onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Modern Tab Navigation Premium */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 border border-white/30 dark:border-gray-700/30",
                "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-indigo-500/5 before:pointer-events-none",
                isMobile && "pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-12"
              )}
            >
              {/* Background gradient premium */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-indigo-600/5 rounded-3xl pointer-events-none"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full"></div>
              
              <TabsList className={cn(
                "relative grid w-full h-auto p-2 sm:p-3 bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-inner",
                "grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3"
              )}>
                {/* Tab Ventes Premium */}
                <TabsTrigger 
                  value="ventes" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30",
                    activeTab === "ventes" 
                      ? "text-white shadow-2xl shadow-purple-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Sparkles className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Ventes<span className="hidden sm:inline"> Produits</span></span>
                </TabsTrigger>
                
                {/* Tab Prêt Familles Premium */}
                <TabsTrigger 
                  value="pret-familles" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30",
                    activeTab === "pret-familles" 
                      ? "text-white shadow-2xl shadow-blue-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Crown className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Prêt<span className="hidden sm:inline"> Familles</span></span>
                </TabsTrigger>
                
                {/* Tab Prêt Produits Premium */}
                <TabsTrigger 
                  value="pret-produits" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-violet-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 dark:hover:from-indigo-900/30 dark:hover:to-violet-900/30",
                    activeTab === "pret-produits" 
                      ? "text-white shadow-2xl shadow-indigo-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Gem className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Prêt<span className="hidden sm:inline"> Produits</span></span>
                </TabsTrigger>
                
                {/* Tab Dépenses Premium */}
                <TabsTrigger 
                  value="depenses" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:via-pink-600 data-[state=active]:to-rose-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-rose-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30",
                    activeTab === "depenses" 
                      ? "text-white shadow-2xl shadow-rose-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Zap className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Dépenses<span className="hidden md:inline"> du Mois</span></span>
                </TabsTrigger>
                
                {/* Tab Inventaire Premium */}
                <TabsTrigger 
                  value="inventaire" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-teal-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-emerald-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30",
                    activeTab === "inventaire" 
                      ? "text-white shadow-2xl shadow-emerald-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Diamond className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Inventaire</span>
                </TabsTrigger>
                
                {/* Tab Calcul Bénéfice Premium */}
                <TabsTrigger 
                  value="calcul-benefice" 
                  className={cn(
                    "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:via-yellow-600 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-amber-500/30 data-[state=active]:scale-105",
                    "hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30",
                    activeTab === "calcul-benefice" 
                      ? "text-white shadow-2xl shadow-amber-500/40" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Award className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-center leading-tight">Calcul<span className="hidden md:inline"> Bénéfice</span></span>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            {/* Content Area Premium */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
            >
              {/* Decorative elements premium */}
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-bl from-purple-400/10 via-pink-400/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative p-3 sm:p-4 md:p-6 lg:p-8">
                <TabsContent value="ventes" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-purple-500/30">
                      <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Ventes & Produits
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gérez vos ventes et votre inventaire premium</p>
                    </div>
                  </div>
                  <VentesProduits />
                </TabsContent>
                
                <TabsContent value="pret-familles" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/30">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Diamond className="absolute -top-1 -right-1 h-4 w-4 text-pink-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Prêts aux Familles
                        <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Suivi des prêts et remboursements familiaux</p>
                    </div>
                  </div>
                  <PretFamilles />
                </TabsContent>
                
                <TabsContent value="pret-produits" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/30">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Award className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Prêts de Produits
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gestion premium des produits prêtés</p>
                    </div>
                  </div>
                  <PretProduits />
                </TabsContent>
                
                <TabsContent value="depenses" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-rose-500/30">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Dépenses Mensuelles
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Suivi et contrôle intelligent de vos dépenses</p>
                    </div>
                  </div>
                  <DepenseDuMois />
                </TabsContent>
                
                <TabsContent value="inventaire" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-emerald-500/30">
                      <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Diamond className="absolute -top-1 -right-1 h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Inventaire des Produits
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Gestion complète et premium de votre stock</p>
                    </div>
                  </div>
                  <Inventaire />
                </TabsContent>
                
                <TabsContent value="calcul-benefice" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/30">
                      <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      <Award className="absolute -top-1 -right-1 h-4 w-4 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent truncate flex items-center gap-2">
                        Calcul de Bénéfices
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Calculez vos marges et prix de vente optimaux</p>
                    </div>
                  </div>
                  <ProfitCalculator />
                </TabsContent>
              </div>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
