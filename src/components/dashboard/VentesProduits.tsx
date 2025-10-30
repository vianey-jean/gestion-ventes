
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedSalesData, useOptimizedProductData } from '@/services/dataOptimizationService';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import ProfessionalLoading from '@/components/ui/professional-loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOverviewSection from './sections/SalesOverviewSection';
import SalesManagementSection from './sections/SalesManagementSection';
import AdvancedDashboardSection from './sections/AdvancedDashboardSection';
import { Crown, ShoppingCart } from 'lucide-react';
import PremiumLoading from '../ui/premium-loading';

/**
 * Composant principal optimisé pour la gestion des ventes
 * Respecte les standards d'accessibilité WCAG 2.1 AA
 * Props immuables et logique séparée de la présentation
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

  // Optimisation des données avec mémoisation (données immuables)
  const optimizedSalesData = useOptimizedSalesData(sales);
  const optimizedProductData = useOptimizedProductData(products);

  /**
   * Gestionnaire de changement d'onglet (fonction pure)
   */
  const handleTabChange = React.useCallback((value: string) => {
    const newTab = value as 'sales' | 'advanced';
    setActiveTab(newTab);
    
    const tabName = newTab === 'sales' ? 'Gestion des ventes' : 'Tableau de bord avancé';
    announceToScreenReader(`Onglet ${tabName} sélectionné`);
  }, [announceToScreenReader]);

  // États de chargement (composants purs pour l'affichage)
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
      className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen"
      role="main"
      aria-label="Gestion des ventes et produits"
    >
      <header className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="responsive-h2 mb-2">
          Gestion des Ventes
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          Mois en cours: {currentMonth}/{currentYear}
        </p>
      </header>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
        aria-label="Navigation des fonctionnalités de vente"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 h-auto mb-4 sm:mb-6 md:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-1.5 sm:p-2">
          <TabsTrigger
            value="sales"
            className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden font-bold text-xs sm:text-sm md:text-base h-14 sm:h-16 w-full py-2 px-2"
            aria-describedby="sales-tab-description"
          >
            <span id="sales-tab-description" className="sr-only">
              Accéder à la gestion des ventes et des produits
            </span>
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-center leading-tight">Gestion<span className="hidden sm:inline"> des Ventes</span><span className="hidden md:inline"> Premium</span></span>
          </TabsTrigger>

          <TabsTrigger
            value="advanced"
            className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden font-bold text-xs sm:text-sm md:text-base h-14 sm:h-16 w-full py-2 px-2"
            aria-describedby="advanced-tab-description"
          >
            <span id="advanced-tab-description" className="sr-only">
              Accéder aux analyses avancées et au tableau de bord exécutif
            </span>
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-data-[state=active]:bg-white/20 shadow-lg shrink-0">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-center leading-tight">Tableau<span className="hidden sm:inline"> de Bord</span><span className="hidden md:inline"> Executive</span></span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4 sm:space-y-6 md:space-y-8" role="tabpanel" aria-labelledby="sales-tab">
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

        <TabsContent value="advanced" role="tabpanel" aria-labelledby="advanced-tab">
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
