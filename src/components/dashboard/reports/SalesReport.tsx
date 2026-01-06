// Résumé :
// Ce composant React affiche un tableau de bord avec indicateurs et graphiques
// (CA, ventes, quantités, évolution mensuelle, top produits, performance).
// Correction : Affiche UNIQUEMENT les données de l'année en cours.
// Les données se réinitialisent automatiquement au 01/01 de chaque nouvelle année.

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { useYearlyData, getSaleValues } from '@/hooks/useYearlyData';

const SalesReport: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  
  // Utiliser le hook pour obtenir les données de l'année en cours
  const { currentYear, currentYearSales, currentYearMonthlyStats, currentYearTotals } = useYearlyData(allSales);

  // Données des produits pour l'année en cours uniquement
  const productData = useMemo(() => {
    const productMap = new Map();

    currentYearSales.forEach((sale) => {
      // Format multi-produits
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach((product) => {
          if (!productMap.has(product.productId)) {
            productMap.set(product.productId, {
              name: product.description,
              revenue: 0,
              quantity: 0,
              sales: 0,
            });
          }

          const prodData = productMap.get(product.productId);
          prodData.revenue += product.sellingPrice * product.quantitySold;
          prodData.quantity += product.quantitySold;
          prodData.sales += 1;
        });
      }
      // Format single-produit
      else if (sale.productId) {
        const saleValues = getSaleValues(sale);
        
        if (!productMap.has(sale.productId)) {
          productMap.set(sale.productId, {
            name: sale.description || 'Produit inconnu',
            revenue: 0,
            quantity: 0,
            sales: 0,
          });
        }

        const prodData = productMap.get(sale.productId);
        prodData.revenue += saleValues.revenue;
        prodData.quantity += saleValues.quantity;
        prodData.sales += 1;
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [currentYearSales]);

  // Formater les données mensuelles pour les graphiques
  const monthlyChartData = currentYearMonthlyStats.map(m => ({
    month: m.month,
    revenue: m.revenue,
    quantity: m.quantity,
    profit: m.profit,
    sales: m.salesCount
  }));

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Indicateur d'année en cours */}
      <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Statistiques de l'année {currentYear} (réinitialisées au 01/01/{currentYear})
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard
          title={`Chiffre d'Affaires ${currentYear}`}
          icon={DollarSign}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
        >
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(currentYearTotals.revenue)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Revenue total de l'année
          </p>
        </ModernCard>

        <ModernCard
          title={`Ventes ${currentYear}`}
          icon={BarChart3}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {currentYearTotals.salesCount}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Transactions de l'année
          </p>
        </ModernCard>

        <ModernCard
          title={`Quantité ${currentYear}`}
          icon={Package}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {currentYearTotals.quantity}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Unités vendues cette année
          </p>
        </ModernCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courbe mensuelle corrigée */}
        <ModernCard
          title={`Évolution Mensuelle ${currentYear}`}
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(value as number)
                      : value,
                    name === 'revenue'
                      ? 'Revenus'
                      : name === 'quantity'
                      ? 'Quantité'
                      : 'Ventes',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        {/* Top produits */}
        <ModernCard title={`Top Produits ${currentYear}`} icon={Package}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {productData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {productData.slice(0, 3).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-sm font-medium truncate">
                    {product.name.substring(0, 20)}...
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(product.revenue)}
                </Badge>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Performance mensuelle */}
        <ModernCard title={`Performance Mensuelle ${currentYear}`} icon={BarChart3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Profit']}
                />
                <Bar
                  dataKey="profit"
                  fill="url(#profitGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default SalesReport;
