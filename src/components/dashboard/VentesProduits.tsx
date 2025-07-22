
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
      <div 
        className="flex justify-center items-center py-12"
        role="status"
        aria-live="polite"
      >
        <ProfessionalLoading 
          text="Authentification requise"
          variant="spinner"
          size="lg"
        />
      </div>
    );
  }

  if (appLoading || authLoading) {
    return (
      <div 
        className="flex justify-center items-center py-12"
        role="status"
        aria-live="polite"
      >
        <ProfessionalLoading 
          text="Chargement des données de vente..."
          variant="dots"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div 
      className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen"
      role="main"
      aria-label="Gestion des ventes et produits"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Ventes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Mois en cours: {currentMonth}/{currentYear}
        </p>
      </header>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
        aria-label="Navigation des fonctionnalités de vente"
      >
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-2 h-auto mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2">
          <TabsTrigger
            value="sales"
            className="group relative flex items-center gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden font-bold text-base h-16 w-full"
            aria-describedby="sales-tab-description"
          >
            <span id="sales-tab-description" className="sr-only">
              Accéder à la gestion des ventes et des produits
            </span>
            <div className="rem p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 group-data-[state=active]:bg-white/20 shadow-lg">
                <ShoppingCart className="h-5 w-5 " />
            </div>
            Gestion des Ventes Premium
          </TabsTrigger>

          <TabsTrigger
            value="advanced"
            className="group relative flex items-center gap-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden font-bold text-base h-16 w-full"
            aria-describedby="advanced-tab-description"
          >
            <span id="advanced-tab-description" className="sr-only">
              Accéder aux analyses avancées et au tableau de bord exécutif
            </span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-data-[state=active]:bg-white/20 shadow-lg">
              <Crown className="h-5 w-5" />
            </div>
            Tableau de Bord Executive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-8" role="tabpanel" aria-labelledby="sales-tab">
          <SalesOverviewSection 
            salesData={optimizedSalesData}
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
