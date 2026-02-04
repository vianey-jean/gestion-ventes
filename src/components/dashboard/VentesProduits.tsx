import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedSalesData, useOptimizedProductData } from '@/services/dataOptimizationService';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import ProfessionalLoading from '@/components/ui/professional-loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOverviewSection from './sections/SalesOverviewSection';
import SalesManagementSection from './sections/SalesManagementSection';
import AdvancedDashboardSection from './sections/AdvancedDashboardSection';
import { Crown, ShoppingCart, Diamond, Sparkles, Gem, Zap } from 'lucide-react';
import PremiumLoading from '../ui/premium-loading';

/**
 * Composant principal optimisé pour la gestion des ventes
 * Design luxe et moderne avec icônes premium
 */
const VentesProduits: React.FC = React.memo(() => {
  const { 
    sales, 
    products, 
    isLoading: appLoading,
    currentMonth,
    currentYear
  } = useApp();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { announceToScreenReader } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'sales' | 'advanced'>('sales');

  // Optimisation des données avec mémoisation
  const optimizedSalesData = useOptimizedSalesData(sales);
  const optimizedProductData = useOptimizedProductData(products);

  const handleTabChange = React.useCallback((value: string) => {
    const newTab = value as 'sales' | 'advanced';
    setActiveTab(newTab);
    
    const tabName = newTab === 'sales' ? 'Gestion des ventes' : 'Tableau de bord avancé';
    announceToScreenReader(`Onglet ${tabName} sélectionné`);
  }, [announceToScreenReader]);

  if (!isAuthenticated) {
    return (
      <PremiumLoading
        text="Authentification requise"
        variant="ventes"
        size="lg"
      />
    );
  }

  if (appLoading || authLoading) {
    return (
      <PremiumLoading 
        text="Chargement des Ventes et Produits ...."
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div 
      className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 min-h-screen"
      role="main"
      aria-label="Gestion des ventes et produits"
    >
      {/* Header Premium */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/30">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Gestion des Ventes
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                Mois en cours: {currentMonth}/{currentYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              Premium
            </span>
          </div>
        </div>
      </motion.header>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
        aria-label="Navigation des fonctionnalités de vente"
      >
        <TabsList className="grid w-full grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 h-auto mb-4 sm:mb-6 md:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-xl sm:rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 p-2 sm:p-3">
          <TabsTrigger
            value="sales"
            className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-teal-600 
                       data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30
                       transition-all duration-500 hover:shadow-lg rounded-lg sm:rounded-xl overflow-hidden 
                       font-bold text-xs sm:text-sm md:text-base h-14 sm:h-16 w-full py-2 px-3"
          >
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 group-data-[state=active]:bg-white/20 shadow-lg">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-center leading-tight">
              Gestion<span className="hidden sm:inline"> des Ventes</span>
            </span>
            <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 opacity-0 group-data-[state=active]:opacity-100 transition-opacity hidden sm:block" />
          </TabsTrigger>

          <TabsTrigger
            value="advanced"
            className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-indigo-600 
                       data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/30
                       transition-all duration-500 hover:shadow-lg rounded-lg sm:rounded-xl overflow-hidden 
                       font-bold text-xs sm:text-sm md:text-base h-14 sm:h-16 w-full py-2 px-3"
          >
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-data-[state=active]:bg-white/20 shadow-lg">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-center leading-tight">
              Tableau<span className="hidden sm:inline"> de Bord Executive</span>
            </span>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 opacity-0 group-data-[state=active]:opacity-100 transition-opacity hidden sm:block" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4 sm:space-y-6 md:space-y-8" role="tabpanel">
          <SalesOverviewSection 
            sales={sales}
            productData={optimizedProductData}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
          
          <SalesManagementSection 
            sales={sales}
            products={products}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </TabsContent>

        <TabsContent value="advanced" role="tabpanel">
          <React.Suspense fallback={
            <ProfessionalLoading 
              text="Chargement du tableau de bord avancé..."
              variant="skeleton"
              size="lg"
            />
          }>
            <AdvancedDashboardSection />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
});

VentesProduits.displayName = 'VentesProduits';

export default VentesProduits;
