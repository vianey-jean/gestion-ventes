
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  TrendingUp, 
  Package2, 
  BarChart4, 
  FileSpreadsheet,
  Zap,
  Cpu,
  Rocket,
  Target,
  Crown,
  Gem,
  Star
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
    <div className={`space-y-8 ${className}`}>
      {/* En-tête premium ultra-moderne */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <CardHeader className="relative text-center py-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl">
                <Crown className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            <span className="flex items-center justify-center gap-4">
              <Gem className="h-12 w-12 text-purple-400" />
              Tableau de Bord Premium
              <Star className="h-12 w-12 text-pink-400" />
            </span>
          </CardTitle>
          
          <CardDescription className="text-xl text-gray-300 font-medium max-w-4xl mx-auto leading-relaxed">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Intelligence Artificielle de Nouvelle Génération
              <Rocket className="h-5 w-5 text-blue-400" />
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation ultra-moderne */}
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-2 h-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2">
  
  <TabsTrigger
    value="ai-tools"
    className="group relative flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden w-full h-16"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-data-[state=active]:bg-white/20">
        <Cpu className="h-5 w-5" />
      </div>
      <span className="hidden sm:inline font-bold text-sm">IA & Prédictions</span>
      <span className="sm:hidden font-bold text-sm">IA</span>
    </div>
  </TabsTrigger>

  <TabsTrigger
    value="accounting"
    className="group relative flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden w-full h-16"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 group-data-[state=active]:bg-white/20">
        <TrendingUp className="h-5 w-5" />
      </div>
      <span className="hidden sm:inline font-bold text-sm">Finance Pro</span>
      <span className="sm:hidden font-bold text-sm">Finance</span>
    </div>
  </TabsTrigger>

  <TabsTrigger
    value="inventory"
    className="group relative flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden w-full h-16"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 group-data-[state=active]:bg-white/20">
        <Package2 className="h-5 w-5" />
      </div>
      <span className="hidden sm:inline font-bold text-sm">Stock Intelligent</span>
      <span className="sm:hidden font-bold text-sm">Stock</span>
    </div>
  </TabsTrigger>

  <TabsTrigger
    value="reports"
    className="group relative flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:via-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-xl overflow-hidden w-full h-16"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 group-data-[state=active]:bg-white/20">
        <BarChart4 className="h-5 w-5" />
      </div>
      <span className="hidden sm:inline font-bold text-sm">Analytics Pro</span>
      <span className="sm:hidden font-bold text-sm">Analytics</span>
    </div>
  </TabsTrigger>

</TabsList>


        <TabsContent value="ai-tools" className="space-y-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AIStockManager />
            <AISalesPredictor />
          </div>
          
          {/* Card d'information premium */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-rose-900/30 border-purple-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                Intelligence Artificielle Ultra-Avancée
                <div className="p-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 shadow-xl">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Propulsé par des algorithmes d'IA de dernière génération, notre système analyse vos données en temps réel 
                pour vous fournir des recommandations ultra-précises et maximiser exponentiellement votre ROI.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-8 mt-10">
          <ProfitLossStatement />
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-green-900/30 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-green-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                Suite Financière Executive
                <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Outils financiers de niveau entreprise avec analyses prédictives, automatisation complète et 
                tableaux de bord executives pour une gestion financière d'exception.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-8 mt-10">
          <InventoryAnalyzer />
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-cyan-900/30 border-blue-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
                  <Package2 className="h-7 w-7 text-white" />
                </div>
                Système de Stock Intelligent
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
                  <Package2 className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Technologie avancée d'optimisation des stocks avec IA prédictive, alertes intelligentes et 
                recommandations personnalisées pour une rentabilité maximale.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-8 mt-10">
          <Tabs defaultValue="sales" className="w-full">
           <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2 bg-white/90 from-gray-900 to-slate-900 shadow-xl rounded-xl h-auto p-2">
  
  <TabsTrigger
    value="sales"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <BarChart4 className="h-4 w-4 mr-2" />
    Ventes Premium
  </TabsTrigger>

  <TabsTrigger
    value="profits"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <TrendingUp className="h-4 w-4 mr-2" />
    Profits Executive
  </TabsTrigger>

  <TabsTrigger
    value="rotation"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <Zap className="h-4 w-4 mr-2" />
    Rotation Ultra
  </TabsTrigger>

</TabsList>


            <TabsContent value="sales" className="mt-8">
              <SalesReport />
            </TabsContent>

            <TabsContent value="profits" className="mt-8">
              <ProfitEvolution />
            </TabsContent>

            <TabsContent value="rotation" className="mt-8">
              <StockRotation />
            </TabsContent>
          </Tabs>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-900/30 via-red-900/30 to-pink-900/30 border-orange-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-xl">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                Analytics & Business Intelligence
                 <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-xl">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Suite complète d'analytics avec visualisations interactives, exports automatisés et 
                insights stratégiques pour propulser votre croissance business.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;
