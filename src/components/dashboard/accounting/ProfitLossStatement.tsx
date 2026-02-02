import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Calculator, FileText, Eye, EyeOff, DollarSign, ShoppingCart, Target, ArrowUpRight, Receipt, Percent, BarChart3 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types';

interface PeriodData {
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
  totalProductsSold: number;
  avgOrderValue: number;
}

type ModalType = 'revenue' | 'cost' | 'profit' | null;

const ProfitLossStatement: React.FC = () => {
  const { allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [showDetails, setShowDetails] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Fonction utilitaire pour calculer les valeurs d'une vente
  const getSaleValues = (sale: Sale) => {
    // Nouveau format multi-produits
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      // Pour les ventes multi-produits, utiliser les totaux pré-calculés ou calculer
      const revenue = sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
      const cost = sale.totalPurchasePrice || sale.products.reduce((sum, p) => sum + ((p.purchasePrice || 0)), 0);
      const profit = sale.totalProfit || sale.products.reduce((sum, p) => sum + (p.profit || 0), 0);
      const totalProductsSold = sale.products.reduce((sum, p) => sum + (p.quantitySold || 0), 0);
      
      return { revenue, cost, profit, totalProductsSold };
    }
    // Ancien format single-produit
    else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined && sale.purchasePrice !== undefined) {
      const revenue = (sale.sellingPrice || 0) ;
      const cost = (sale.purchasePrice || 0) ;
      const profit = sale.profit || (revenue - cost);
      const totalProductsSold = sale.quantitySold || 0;
      
      return { revenue, cost, profit, totalProductsSold };
    }
    // Fallback
    return { revenue: 0, cost: 0, profit: 0, totalProductsSold: 0 };
  };

  const calculatePeriodData = (period: string): PeriodData => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalProductsSold = 0;

    periodSales.forEach(sale => {
      const saleValues = getSaleValues(sale);
      totalRevenue += saleValues.revenue;
      totalCost += saleValues.cost;
      totalProfit += saleValues.profit;
      totalProductsSold += saleValues.totalProductsSold;
    });

    const salesCount = periodSales.length;
    const avgOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

    return { 
      revenue: totalRevenue, 
      cost: totalCost, 
      profit: totalProfit, 
      salesCount, 
      totalProductsSold,
      avgOrderValue 
    };
  };

  // Obtenir les ventes de la période pour les modales
  const getPeriodSales = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const currentData = calculatePeriodData(selectedPeriod);
  const previousPeriodData = selectedPeriod === 'current-month' 
    ? calculatePeriodData('last-month')
    : calculatePeriodData('current-month');
  const periodSales = getPeriodSales(selectedPeriod);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const profitMargin = currentData.revenue > 0 ? (currentData.profit / currentData.revenue) * 100 : 0;
  const revenueChange = calculateChange(currentData.revenue, previousPeriodData.revenue);
  const profitChange = calculateChange(currentData.profit, previousPeriodData.profit);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'current-month': return 'Mois en cours';
      case 'last-month': return 'Mois dernier';
      case 'current-quarter': return 'Trimestre en cours';
      case 'current-year': return 'Année en cours';
      default: return 'Période sélectionnée';
    }
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      {/* Modal Chiffre d'Affaires */}
      <Dialog open={activeModal === 'revenue'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Détails Chiffre d'Affaires - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                return (
                  <div 
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {values.totalProductsSold} produit{values.totalProductsSold > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatEuro(values.revenue)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total CA</span>
                <p className="text-xs opacity-80">{currentData.salesCount} transactions</p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.revenue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Coûts d'Achat */}
      <Dialog open={activeModal === 'cost'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Détails Coûts d'Achat - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                const costPercent = values.revenue > 0 ? (values.cost / values.revenue) * 100 : 0;
                return (
                  <div 
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {costPercent.toFixed(1)}% du CA
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {formatEuro(values.cost)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Coûts</span>
                <p className="text-xs opacity-80">
                  {currentData.revenue > 0 ? ((currentData.cost / currentData.revenue) * 100).toFixed(1) : 0}% du CA
                </p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.cost)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Bénéfice Net */}
      <Dialog open={activeModal === 'profit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Détails Bénéfice Net - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                const margin = values.revenue > 0 ? (values.profit / values.revenue) * 100 : 0;
                return (
                  <div 
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Marge: {margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatEuro(values.profit)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Bénéfice</span>
                <p className="text-xs opacity-80">Marge: {profitMargin.toFixed(1)}%</p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.profit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CardHeader className="border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
            <Calculator className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Compte de Résultat
          </span>
        </CardTitle>
        <CardDescription>
          Analyse détaillée des revenus, coûts et bénéfices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mois en cours</SelectItem>
              <SelectItem value="last-month">Mois dernier</SelectItem>
              <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
              <SelectItem value="current-year">Année en cours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Masquer détails' : 'Voir détails'}
          </Button>
        </div>

        <div className="text-center mb-4">
          <Badge variant="outline" className="text-sm px-4 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
            {getPeriodLabel(selectedPeriod)}
          </Badge>
        </div>

        {/* Métriques principales - Premium et Cliquables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveModal('revenue')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Chiffre d'Affaires</h4>
              </div>
              {formatChange(revenueChange)}
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.revenue)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{currentData.totalProductsSold} produits vendus</p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('cost')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:scale-[1.02] hover:border-red-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
                  <Receipt className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300">Coûts d'Achat</h4>
              </div>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.cost)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {currentData.revenue > 0 ? ((currentData.cost / currentData.revenue) * 100).toFixed(1) : 0}% du CA
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('profit')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.02] hover:border-emerald-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                  <Target className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Bénéfice Net</h4>
              </div>
              {formatChange(profitChange)}
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.profit)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Marge: {profitMargin.toFixed(1)}%</p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        {showDetails && (
          <div className="space-y-4">
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Métriques Détaillées
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Panier Moyen</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatEuro(currentData.avgOrderValue)}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Marge Brute</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{profitMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800/50">
                  <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">Nombre de Ventes</p>
                  <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{currentData.salesCount}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50">
                  <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Profit/Vente</p>
                  <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
                    {formatEuro(currentData.salesCount > 0 ? currentData.profit / currentData.salesCount : 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Analyse de performance */}
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Analyse de Performance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Rentabilité</span>
                  <Badge className={`${profitMargin > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 
                                   profitMargin > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                   'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {profitMargin > 20 ? 'Excellente' : profitMargin > 10 ? 'Bonne' : 'À améliorer'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Évolution du CA</span>
                  <Badge className={`${revenueChange > 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 
                                   revenueChange > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                   'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {revenueChange > 10 ? 'Forte croissance' : 
                     revenueChange > 0 ? 'Croissance modérée' : 'En baisse'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Volume de ventes</span>
                  <Badge className={`${currentData.salesCount > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 
                                   currentData.salesCount > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                   'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {currentData.salesCount > 20 ? 'Élevé' : 
                     currentData.salesCount > 10 ? 'Modéré' : 'Faible'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitLossStatement;
