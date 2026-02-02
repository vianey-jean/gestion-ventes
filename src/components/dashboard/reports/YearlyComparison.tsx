import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, AlertTriangle, BarChart3, Euro, ShoppingCart, ArrowUpRight, ArrowDownRight, Minus, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { useYearlyData, getSaleValues } from '@/hooks/useYearlyData';

type ModalType = 'ca' | 'profit' | 'ventes' | null;

interface MonthlyData {
  monthNum: number;
  monthName: string;
  value: number;
  prevYearValue: number | null;
  change: number | null;
}

const YearlyComparison: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  const {
    currentYear,
    allYearsStats,
    yearComparison,
    bestAndWorstYears
  } = useYearlyData(allSales);

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Calculer les données mensuelles pour l'année en cours avec comparaison à l'année précédente
  const monthlyBreakdown = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Stats pour l'année en cours
    const currentYearStats: { [key: number]: { revenue: number; profit: number; salesCount: number } } = {};
    // Stats pour l'année précédente
    const prevYearStats: { [key: number]: { revenue: number; profit: number; salesCount: number } } = {};
    
    // Initialiser les mois écoulés
    for (let m = 1; m <= 12; m++) {
      currentYearStats[m] = { revenue: 0, profit: 0, salesCount: 0 };
      prevYearStats[m] = { revenue: 0, profit: 0, salesCount: 0 };
    }
    
    // Calculer les stats par mois pour les deux années
    allSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const year = saleDate.getFullYear();
      const month = saleDate.getMonth() + 1;
      const values = getSaleValues(sale);
      
      if (year === currentYear) {
        currentYearStats[month].revenue += values.revenue;
        currentYearStats[month].profit += values.profit;
        currentYearStats[month].salesCount += 1;
      } else if (year === currentYear - 1) {
        prevYearStats[month].revenue += values.revenue;
        prevYearStats[month].profit += values.profit;
        prevYearStats[month].salesCount += 1;
      }
    });
    
    // Convertir en tableau avec comparaisons année précédente
    const caData: MonthlyData[] = [];
    const profitData: MonthlyData[] = [];
    const ventesData: MonthlyData[] = [];
    
    for (let m = 1; m <= currentMonth; m++) {
      const currentStats = currentYearStats[m];
      const prevStats = prevYearStats[m];
      
      // Calcul du changement vs même mois année précédente
      const calcChange = (current: number, prev: number) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
      };
      
      caData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.revenue,
        prevYearValue: prevStats.revenue,
        change: calcChange(currentStats.revenue, prevStats.revenue)
      });
      
      profitData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.profit,
        prevYearValue: prevStats.profit,
        change: calcChange(currentStats.profit, prevStats.profit)
      });
      
      ventesData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.salesCount,
        prevYearValue: prevStats.salesCount,
        change: calcChange(currentStats.salesCount, prevStats.salesCount)
      });
    }
    
    return { ca: caData, profit: profitData, ventes: ventesData };
  }, [allSales, currentYear]);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const formatChange = (change: number) => {
    const Icon = getChangeIcon(change);
    return (
      <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    );
  };

  // Rendu d'une ligne mensuelle avec comparaison année précédente
  const renderMonthRow = (data: MonthlyData, formatValue: (v: number) => string, colorClass: string, bgClass: string) => (
    <div 
      key={data.monthNum}
      className={`flex items-center justify-between p-4 rounded-xl ${bgClass} border border-gray-100 dark:border-gray-700/50 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white font-bold text-sm`}>
          {data.monthNum}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{data.monthName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {data.monthName} {currentYear - 1}: {formatValue(data.prevYearValue || 0)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-lg font-bold ${colorClass.replace('bg-gradient-to-r', 'bg-clip-text text-transparent bg-gradient-to-r')}`}>
            {formatValue(data.value)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          data.change !== null && data.change > 0 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : data.change !== null && data.change < 0 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {data.change !== null && data.change > 0 ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : data.change !== null && data.change < 0 ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {data.change !== null ? `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}%` : '0%'}
        </div>
      </div>
    </div>
  );

  // Données pour le graphique de comparaison annuelle
  const chartData = allYearsStats.map(stat => ({
    year: stat.year.toString(),
    'Chiffre d\'Affaires': stat.totalRevenue,
    'Profit': stat.totalProfit,
    'Ventes': stat.salesCount
  }));

  return (
    <div className="space-y-6">
      {/* Modal CA */}
      <Dialog open={activeModal === 'ca'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Euro className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chiffre d'Affaires Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.ca.map(data => 
                renderMonthRow(
                  data, 
                  (v) => formatCurrency(v),
                  'bg-gradient-to-r from-blue-500 to-indigo-600',
                  'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{formatCurrency(yearComparison.current.totalRevenue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Profit */}
      <Dialog open={activeModal === 'profit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Profit Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.profit.map(data => 
                renderMonthRow(
                  data, 
                  (v) => formatCurrency(v),
                  'bg-gradient-to-r from-emerald-500 to-green-600',
                  'bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{formatCurrency(yearComparison.current.totalProfit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ventes */}
      <Dialog open={activeModal === 'ventes'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ventes Mensuelles {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.ventes.map(data => 
                renderMonthRow(
                  data, 
                  (v) => `${v} vente${v > 1 ? 's' : ''}`,
                  'bg-gradient-to-r from-purple-500 to-pink-600',
                  'bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{yearComparison.current.salesCount} ventes</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* En-tête avec année en cours */}
      <div className="text-center p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Statistiques {currentYear}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Données réinitialisées au 01/01/{currentYear} - Comparaison avec {currentYear - 1}
        </p>
      </div>

      {/* KPI Année en cours vs Année précédente - Cartes Interactives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carte CA - Interactive */}
        <div 
          onClick={() => setActiveModal('ca')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`CA ${currentYear}`}
            icon={BarChart3}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:scale-[1.02] group-hover:border-blue-400/50"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              {formatCurrency(yearComparison.current.totalRevenue)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalRevenue)}
              </span>
              {formatChange(yearComparison.revenueChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        {/* Carte Profit - Interactive */}
        <div 
          onClick={() => setActiveModal('profit')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Profit ${currentYear}`}
            icon={TrendingUp}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/20 group-hover:scale-[1.02] group-hover:border-emerald-400/50"
          >
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              {formatCurrency(yearComparison.current.totalProfit)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalProfit)}
              </span>
              {formatChange(yearComparison.profitChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        {/* Carte Ventes - Interactive */}
        <div 
          onClick={() => setActiveModal('ventes')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Ventes ${currentYear}`}
            icon={BarChart3}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:scale-[1.02] group-hover:border-purple-400/50"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              {yearComparison.current.salesCount}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {yearComparison.previous.salesCount}
              </span>
              {formatChange(yearComparison.salesCountChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Graphique de comparaison annuelle */}
      {allYearsStats.length > 0 && (
        <ModernCard
          title="Évolution Annuelle"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'Ventes' ? value : formatCurrency(value as number),
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="Chiffre d'Affaires" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      )}

      {/* Meilleure et pire année */}
      {allYearsStats.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernCard
            title="Meilleure Année (CA)"
            icon={Award}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
          >
            {bestAndWorstYears.bestRevenue && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
                    {bestAndWorstYears.bestRevenue.year}
                  </Badge>
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                  {formatCurrency(bestAndWorstYears.bestRevenue.totalRevenue)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {bestAndWorstYears.bestRevenue.salesCount} ventes • 
                  Profit: {formatCurrency(bestAndWorstYears.bestRevenue.totalProfit)}
                </p>
              </div>
            )}
          </ModernCard>

          <ModernCard
            title="Année à Améliorer (CA)"
            icon={AlertTriangle}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
          >
            {bestAndWorstYears.worstRevenue && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                    {bestAndWorstYears.worstRevenue.year}
                  </Badge>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
                  {formatCurrency(bestAndWorstYears.worstRevenue.totalRevenue)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {bestAndWorstYears.worstRevenue.salesCount} ventes • 
                  Profit: {formatCurrency(bestAndWorstYears.worstRevenue.totalProfit)}
                </p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {/* Tableau récapitulatif par année */}
      {allYearsStats.length > 0 && (
        <ModernCard
          title="Récapitulatif par Année"
          icon={Calendar}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Année</th>
                  <th className="text-right py-3 px-4 font-semibold">CA Total</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Coûts</th>
                  <th className="text-right py-3 px-4 font-semibold">Ventes</th>
                  <th className="text-right py-3 px-4 font-semibold">Marge</th>
                </tr>
              </thead>
              <tbody>
                {allYearsStats.map((stat, index) => {
                  const margin = stat.totalRevenue > 0 
                    ? ((stat.totalProfit / stat.totalRevenue) * 100).toFixed(1) 
                    : '0.0';
                  const isCurrentYear = stat.year === currentYear;
                  
                  return (
                    <tr 
                      key={stat.year}
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        isCurrentYear ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stat.year}</span>
                          {isCurrentYear && (
                            <Badge className="bg-indigo-500 text-white text-xs">
                              En cours
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(stat.totalRevenue)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(stat.totalProfit)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">
                        {formatCurrency(stat.totalCost)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {stat.salesCount}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge className={
                          Number(margin) > 30 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          Number(margin) > 15 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }>
                          {margin}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModernCard>
      )}

      {/* Message si aucune donnée */}
      {allYearsStats.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les statistiques annuelles s'afficheront ici une fois que des ventes seront enregistrées.
          </p>
        </div>
      )}
    </div>
  );
};

export default YearlyComparison;
