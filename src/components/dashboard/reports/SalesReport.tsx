
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Package, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

const SalesReport: React.FC = () => {
  const { allSales, products } = useApp();
  const { formatCurrency } = useCurrencyFormatter();

  const salesData = useMemo(() => {
    const monthlyData = new Map();
    const productData = new Map();
    let totalRevenue = 0;
    let totalQuantity = 0;

    allSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

      // Données mensuelles
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          revenue: 0,
          quantity: 0,
          profit: 0,
          sales: 0
        });
      }

      const monthData = monthlyData.get(monthKey);
      monthData.revenue += sale.sellingPrice ;
      monthData.quantity += sale.quantitySold;
      monthData.profit += sale.profit || 0;
      monthData.sales += 1;

      // Données par produit
      if (!productData.has(sale.productId)) {
        productData.set(sale.productId, {
          name: sale.description,
          revenue: 0,
          quantity: 0,
          sales: 0
        });
      }

      const prodData = productData.get(sale.productId);
      prodData.revenue += sale.sellingPrice * sale.quantitySold;
      prodData.quantity += sale.quantitySold;
      prodData.sales += 1;

      totalRevenue += sale.sellingPrice * sale.quantitySold;
      totalQuantity += sale.quantitySold;
    });

    return {
      monthly: Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month)),
      products: Array.from(productData.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      totals: { revenue: totalRevenue, quantity: totalQuantity, sales: allSales.length }
    };
  }, [allSales]);

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard
          title="Chiffre d'Affaires"
          icon={DollarSign}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
        >
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(salesData.totals.revenue)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Revenue total généré
          </p>
        </ModernCard>

        <ModernCard
          title="Nombre de Ventes"
          icon={BarChart3}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {salesData.totals.sales}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Transactions réalisées
          </p>
        </ModernCard>

        <ModernCard
          title="Quantité Vendue"
          icon={Package}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {salesData.totals.quantity}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Unités vendues
          </p>
        </ModernCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Évolution Mensuelle"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.monthly}>
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
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenus' : name === 'quantity' ? 'Quantité' : 'Ventes'
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

        <ModernCard
          title="Top Produits"
          icon={Package}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesData.products}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {salesData.products.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {salesData.products.slice(0, 3).map((product, index) => (
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

        <ModernCard
          title="Performance Mensuelle"
          icon={BarChart3}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData.monthly.slice(-6)}>
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
                  formatter={(value) => [formatCurrency(value as number), 'Profit']}
                />
                <Bar 
                  dataKey="profit" 
                  fill="url(#profitGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
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
