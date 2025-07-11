
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Calculator, 
  Package, 
  TrendingUp, 
  BarChart3, 
  FileText,
  Sparkles,
  Activity,
  Zap,
  Target
} from 'lucide-react';

// Importer tous nos composants
import AIStockManager from './ai/AIStockManager';
import AISalesPredictor from './ai/AISalesPredictor';
import ProfitLossStatement from './accounting/ProfitLossStatement';
import InventoryAnalyzer from './inventory/InventoryAnalyzer';
import SalesReport from './reports/SalesReport';
import ProfitEvolution from './reports/ProfitEvolution';
import StockRotation from './reports/StockRotation';

interface AdvancedDashboardProps {
  className?: string;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('ai-tools');

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            Tableau de Bord Avancé Premium
          </CardTitle>
          <CardDescription className="text-lg text-blue-700 dark:text-blue-300 font-medium">
            Intelligence artificielle • Analytics avancés • Insights métier
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-800">
          <TabsTrigger 
            value="ai-tools" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 hover:shadow-md rounded-lg"
          >
            <Brain className="h-5 w-5" />
            <span className="hidden sm:inline font-semibold">IA & Prédictions</span>
            <span className="sm:hidden font-semibold">IA</span>
          </TabsTrigger>
          <TabsTrigger 
            value="accounting" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300 hover:shadow-md rounded-lg"
          >
            <Calculator className="h-5 w-5" />
            <span className="hidden sm:inline font-semibold">Comptabilité</span>
            <span className="sm:hidden font-semibold">Compta</span>
          </TabsTrigger>
          <TabsTrigger 
            value="inventory" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300 hover:shadow-md rounded-lg"
          >
            <Package className="h-5 w-5" />
            <span className="hidden sm:inline font-semibold">Inventaire</span>
            <span className="sm:hidden font-semibold">Stock</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300 hover:shadow-md rounded-lg"
          >
            <FileText className="h-5 w-5" />
            <span className="hidden sm:inline font-semibold">Rapports</span>
            <span className="sm:hidden font-semibold">Rapports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-tools" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIStockManager />
            <AISalesPredictor />
          </div>
          
          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Intelligence Artificielle Avancée
              </CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300 font-medium">
                Nos algorithmes d'IA de dernière génération analysent vos données en temps réel pour vous fournir 
                des recommandations intelligentes et des prédictions ultra-précises pour maximiser votre ROI.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-6 mt-8">
          <ProfitLossStatement />
          
          <Card className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                Gestion Comptable Premium
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300 font-medium">
                Suite comptable complète avec analyses prédictives, rapports automatisés et tableaux de bord 
                financiers pour une gestion optimale de votre trésorerie et rentabilité.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-8">
          <InventoryAnalyzer />
          
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Optimisation Intelligente des Stocks
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 font-medium">
                Système avancé d'analyse et d'optimisation des stocks avec prédictions de demande, 
                alertes automatisées et recommandations personnalisées pour maximiser votre rentabilité.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-8">
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 shadow-lg rounded-lg h-12">
              <TabsTrigger 
                value="sales"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 rounded-md font-semibold"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapport Ventes
              </TabsTrigger>
              <TabsTrigger 
                value="profits"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300 rounded-md font-semibold"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Évolution Profits
              </TabsTrigger>
              <TabsTrigger 
                value="rotation"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 rounded-md font-semibold"
              >
                <Zap className="h-4 w-4 mr-2" />
                Rotation Stock
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-6">
              <SalesReport />
            </TabsContent>

            <TabsContent value="profits" className="mt-6">
              <ProfitEvolution />
            </TabsContent>

            <TabsContent value="rotation" className="mt-6">
              <StockRotation />
            </TabsContent>
          </Tabs>
          
          <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 border-orange-200 dark:border-orange-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-orange-900 dark:text-orange-100 flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Analytics & Rapports Premium
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300 font-medium">
                Suite complète de rapports interactifs et d'analyses approfondies avec visualisations 
                en temps réel, exports automatisées et insights actionables pour votre croissance.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;
