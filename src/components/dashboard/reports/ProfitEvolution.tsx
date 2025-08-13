import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Sale } from '@/types';

const ProfitEvolution: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();

  // Fonction utilitaire pour calculer les valeurs d'une vente
  const getSaleValues = (sale: Sale) => {
    // Nouveau format multi-produits
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      const revenue = sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice * p.quantitySold), 0);
      const quantity = sale.products.reduce((sum, p) => sum + p.quantitySold, 0);
      const profit = sale.totalProfit || sale.products.reduce((sum, p) => sum + p.profit, 0);
      
      return { revenue, quantity, profit };
    }
    // Ancien format single-produit
    else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined) {
      const revenue = sale.sellingPrice * sale.quantitySold;
      const quantity = sale.quantitySold;
      const profit = sale.profit || 0;
      
      return { revenue, quantity, profit };
    }
    // Fallback
    return { revenue: 0, quantity: 0, profit: 0 };
  };

  const profitData = useMemo(() => {
    const monthlyData = new Map();
    let totalProfit = 0;
    let totalExpenses = 0;
    let bestMonth = { month: '', profit: 0 };
    let worstMonth = { month: '', profit: Infinity };

    // Analyser les ventes et profits
    allSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      
      const saleValues = getSaleValues(sale);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          revenue: 0,
          profit: 0,
          expenses: 0,
          netProfit: 0,
          margin: 0,
          sales: 0
        });
      }

      const data = monthlyData.get(monthKey);
      data.revenue += saleValues.revenue;
      data.profit += saleValues.profit;
      data.sales += 1;
      totalProfit += saleValues.profit;
    });

    // Simuler quelques dépenses pour l'exemple
    const mockExpenses = 500; // Dépenses mensuelles simulées
    Array.from(monthlyData.values()).forEach(data => {
      data.expenses = mockExpenses;
      totalExpenses += mockExpenses;
    });

    // Calculer le profit net et les marges
    Array.from(monthlyData.values()).forEach(data => {
      data.netProfit = data.profit - data.expenses;
      data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      
      if (data.netProfit > bestMonth.profit) {
        bestMonth = { month: data.month, profit: data.netProfit };
      }
      if (data.netProfit < worstMonth.profit) {
        worstMonth = { month: data.month, profit: data.netProfit };
      }
    });

    const sortedData = Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
    const currentMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData[sortedData.length - 2];
    
    const growthRate = previousMonth ? 
      ((currentMonth?.netProfit - previousMonth.netProfit) / Math.abs(previousMonth.netProfit || 1)) * 100 : 0;

    return {
      monthly: sortedData,
      totals: {
        profit: totalProfit,
        expenses: totalExpenses,
        netProfit: totalProfit - totalExpenses
      },
      insights: {
        bestMonth,
        worstMonth,
        growthRate,
        averageMargin: sortedData.length > 0 ? sortedData.reduce((acc, data) => acc + data.margin, 0) / sortedData.length : 0
      }
    };
  }, [allSales]);

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (rate < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard
          title="Profit Brut"
          icon={DollarSign}
          className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(profitData.totals.profit)}
          </div>
          <div className="flex items-center mt-2">
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              +{profitData.insights.averageMargin.toFixed(1)}% marge
            </Badge>
          </div>
        </ModernCard>

        <ModernCard
          title="Dépenses"
          icon={Calculator}
          className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(profitData.totals.expenses)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Coûts opérationnels
          </p>
        </ModernCard>

        <ModernCard
          title="Profit Net"
          icon={Target}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(profitData.totals.netProfit)}
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getGrowthIcon(profitData.insights.growthRate), {
              className: `h-4 w-4 ${getGrowthColor(profitData.insights.growthRate)} mr-1`
            })}
            <span className={`text-xs font-medium ${getGrowthColor(profitData.insights.growthRate)}`}>
              {profitData.insights.growthRate.toFixed(1)}%
            </span>
          </div>
        </ModernCard>

        <ModernCard
          title="Meilleur Mois"
          icon={Award}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {profitData.insights.bestMonth.month}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {formatCurrency(profitData.insights.bestMonth.profit)}
          </div>
        </ModernCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Évolution du Profit Net"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitData.monthly}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'profit' ? 'Profit Brut' : 
                    name === 'expenses' ? 'Dépenses' : 'Profit Net'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444"
                  fill="url(#expenseGradient)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 6 }}
                  activeDot={{ r: 8, fill: '#8B5CF6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        <ModernCard
          title="Marge de Profit"
          icon={Calculator}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData.monthly}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Marge']}
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6, fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        <ModernCard
          title="Analyse des Tendances"
          icon={Target}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Croissance Mensuelle
                </span>
                <div className="flex items-center">
                  {React.createElement(getGrowthIcon(profitData.insights.growthRate), {
                    className: `h-4 w-4 ${getGrowthColor(profitData.insights.growthRate)} mr-1`
                  })}
                  <span className={`text-sm font-bold ${getGrowthColor(profitData.insights.growthRate)}`}>
                    {profitData.insights.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Marge Moyenne
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {profitData.insights.averageMargin.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  Performance
                </span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  {profitData.insights.growthRate > 0 ? 'Croissante' : 'À surveiller'}
                </Badge>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default ProfitEvolution;
