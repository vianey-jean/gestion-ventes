import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { useYearlyData } from '@/hooks/useYearlyData';

const YearlyComparison: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  const {
    currentYear,
    allYearsStats,
    yearComparison,
    bestAndWorstYears
  } = useYearlyData(allSales);

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

  // Données pour le graphique de comparaison annuelle
  const chartData = allYearsStats.map(stat => ({
    year: stat.year.toString(),
    'Chiffre d\'Affaires': stat.totalRevenue,
    'Profit': stat.totalProfit,
    'Ventes': stat.salesCount
  }));

  return (
    <div className="space-y-6">
      {/* En-tête avec année en cours */}
      <div className="text-center p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Statistiques {currentYear}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Données réinitialisées au 01/01/{currentYear} - Analyse comparative avec les années précédentes
        </p>
      </div>

      {/* KPI Année en cours vs Année précédente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard
          title={`CA ${currentYear}`}
          icon={BarChart3}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(yearComparison.current.totalRevenue)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalRevenue)}
            </span>
            {formatChange(yearComparison.revenueChange)}
          </div>
        </ModernCard>

        <ModernCard
          title={`Profit ${currentYear}`}
          icon={TrendingUp}
          className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(yearComparison.current.totalProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalProfit)}
            </span>
            {formatChange(yearComparison.profitChange)}
          </div>
        </ModernCard>

        <ModernCard
          title={`Ventes ${currentYear}`}
          icon={BarChart3}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {yearComparison.current.salesCount}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              vs {currentYear - 1}: {yearComparison.previous.salesCount}
            </span>
            {formatChange(yearComparison.salesCountChange)}
          </div>
        </ModernCard>
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
