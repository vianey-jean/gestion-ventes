import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Award, Target, ShoppingCart, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const TendancesPage = () => {
  const { allSales, products, loading } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Fonction pour déterminer la catégorie d'un produit
  const getProductCategory = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('tissage')) {
      return 'Tissages';
    } else if (desc.includes('perruque')) {
      return 'Perruques';
    } else if (desc.includes('colle') || desc.includes('disolvant')) {
      return 'Accessoires';
    } else if (desc.includes('avance')) {
      return 'Avances';
    }
    return 'Autres';
  };

  // Données pour les graphiques de ventes par produit (utiliser allSales)
  const salesByProduct = useMemo(() => {
    const productSales = allSales.reduce((acc, sale) => {
      const productName = sale.description.length > 50 ? 
        sale.description.substring(0, 47) + '...' : 
        sale.description;
      
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          fullName: sale.description,
          ventes: 0,
          benefice: 0,
          quantite: 0,
          prixAchat: 0,
          category: getProductCategory(sale.description),
          count: 0
        };
      }
      acc[productName].ventes += sale.sellingPrice;
      acc[productName].benefice += sale.profit;
      acc[productName].quantite += sale.quantitySold;
      acc[productName].prixAchat += sale.purchasePrice;
      acc[productName].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .sort((a, b) => b.benefice - a.benefice)
      .slice(0, 15); // Top 15 produits
  }, [allSales]);

  // Données pour les graphiques par catégorie (utiliser allSales)
  const salesByCategory = useMemo(() => {
    const categorySales = allSales.reduce((acc, sale) => {
      const category = getProductCategory(sale.description);
      if (!acc[category]) {
        acc[category] = {
          category,
          ventes: 0,
          benefice: 0,
          quantite: 0,
          count: 0
        };
      }
      acc[category].ventes += sale.sellingPrice;
      acc[category].benefice += sale.profit;
      acc[category].quantite += sale.quantitySold;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categorySales);
  }, [allSales]);

  // Données temporelles (par mois) (utiliser allSales)
  const salesOverTime = useMemo(() => {
    const monthlySales = allSales.reduce((acc, sale) => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          mois: monthKey,
          monthName: monthName,
          ventes: 0,
          benefice: 0,
          quantite: 0
        };
      }
      acc[monthKey].ventes += sale.sellingPrice;
      acc[monthKey].benefice += sale.profit;
      acc[monthKey].quantite += sale.quantitySold;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlySales).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [allSales]);

  // Produits les plus rentables
  const topProfitableProducts = useMemo(() => {
    return salesByProduct
      .filter(product => product.benefice > 0)
      .sort((a, b) => b.benefice - a.benefice)
      .slice(0, 10);
  }, [salesByProduct]);

  // Recommandations d'achat basées sur le ROI
  const buyingRecommendations = useMemo(() => {
    return salesByProduct
      .filter(product => product.benefice > 30 && product.prixAchat > 0)
      .sort((a, b) => (b.benefice / b.prixAchat) - (a.benefice / a.prixAchat))
      .slice(0, 8)
      .map(product => ({
        ...product,
        roi: ((product.benefice / product.prixAchat) * 100).toFixed(1),
        avgProfit: (product.benefice / product.count).toFixed(2)
      }));
  }, [salesByProduct]);

  // Couleurs pour les graphiques
  const colors = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981', '#F97316'];
  const categoryColors = {
    'Perruques': '#8B5CF6',
    'Tissages': '#06D6A0',
    'Accessoires': '#F59E0B',
    'Avances': '#EF4444',
    'Autres': '#6B7280'
  };

  const chartConfig = {
    ventes: { label: "Ventes", color: "#8B5CF6" },
    benefice: { label: "Bénéfice", color: "#06D6A0" },
    quantite: { label: "Quantité", color: "#F59E0B" }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des tendances...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="h-4 w-4 mr-2 animate-pulse" />
              Analyse des tendances en temps réel
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Tendances & Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez vos performances, identifiez les opportunités et optimisez vos ventes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allSales.reduce((sum, sale) => sum + sale.sellingPrice, 0).toLocaleString()} €
                </div>
                <p className="text-xs text-purple-100">
                  +{allSales.length} transactions historiques
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bénéfices</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allSales.reduce((sum, sale) => sum + sale.profit, 0).toLocaleString()} €
                </div>
                <p className="text-xs text-emerald-100">
                  Marge moyenne: {allSales.length > 0 ? ((allSales.reduce((sum, sale) => sum + sale.profit, 0) / allSales.reduce((sum, sale) => sum + sale.sellingPrice, 0)) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits Vendus</CardTitle>
                <Package className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allSales.reduce((sum, sale) => sum + sale.quantitySold, 0)}
                </div>
                <p className="text-xs text-orange-100">
                  {salesByProduct.length} produits différents
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meilleur ROI</CardTitle>
                <Award className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {buyingRecommendations.length > 0 ? buyingRecommendations[0].roi : '0'}%
                </div>
                <p className="text-xs text-blue-100">
                  {buyingRecommendations.length > 0 ? buyingRecommendations[0].name.slice(0, 20) + '...' : 'Aucune donnée'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <Tabs defaultValue="overview" className="space-y-8">
         <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
  
            {/* Conteneur avec overflow horizontal sur mobile */}
            <div className="overflow-x-auto">
              
              <TabsList className="inline-flex min-w-max gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2">
                <TabsTrigger value="overview" className="rounded-xl font-semibold whitespace-nowrap">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="products" className="rounded-xl font-semibold whitespace-nowrap">Par Produits</TabsTrigger>
                <TabsTrigger value="categories" className="rounded-xl font-semibold whitespace-nowrap">Par Catégories</TabsTrigger>
                <TabsTrigger value="recommendations" className="rounded-xl font-semibold whitespace-nowrap">Recommandations</TabsTrigger>
              </TabsList>

            </div>
            
          </div>


            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Évolution des Ventes
                    </CardTitle>
                    <CardDescription>Progression mensuelle des ventes et bénéfices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesOverTime}>
                          <defs>
                            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#06D6A0" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="monthName" tick={{ fontSize: 12 }} stroke="#64748b" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-semibold">{label}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ color: entry.color }}>
                                        {entry.name}: {entry.value?.toLocaleString()} €
                                      </p>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="ventes" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorVentes)" strokeWidth={3} name="Ventes (€)" />
                          <Area type="monotone" dataKey="benefice" stroke="#06D6A0" fillOpacity={1} fill="url(#colorBenefice)" strokeWidth={3} name="Bénéfice (€)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Top 10 Produits les Plus Rentables
                    </CardTitle>
                    <CardDescription>Classement par bénéfice généré</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full bg-white/50 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProfitableProducts.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={100} 
                            tick={{ fontSize: 10 }} 
                            stroke="#64748b"
                            interval={0}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            stroke="#64748b"
                            label={{ value: 'Bénéfice (€)', angle: -90, position: 'insideLeft' }}
                          />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-xl border-gray-200 dark:border-gray-600">
                                    <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">{data.fullName || label}</p>
                                    <div className="space-y-1">
                                      <p className="text-emerald-600 dark:text-emerald-400 flex items-center">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                        Bénéfice: <span className="font-bold ml-1">{payload[0].value?.toLocaleString()} €</span>
                                      </p>
                                      <p className="text-blue-600 dark:text-blue-400 text-xs">
                                        Quantité vendue: {data.quantite}
                                      </p>
                                      <p className="text-purple-600 dark:text-purple-400 text-xs">
                                        Ventes totales: {data.ventes?.toLocaleString()} €
                                      </p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="benefice" 
                            fill="url(#beneficeGradient)" 
                            radius={[4, 4, 0, 0]} 
                            name="Bénéfice (€)"
                            stroke="#06D6A0"
                            strokeWidth={1}
                          />
                          <defs>
                            <linearGradient id="beneficeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#06D6A0" stopOpacity={0.6}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Par Produits */}
            <TabsContent value="products" className="space-y-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    Performance par Produit
                  </CardTitle>
                  <CardDescription>Analyse détaillée des ventes, bénéfices et prix d'achat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full bg-white/50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByProduct.slice(0, 12)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                        <ChartTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border rounded-lg shadow-lg">
                                  <p className="font-semibold text-sm">{label}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} style={{ color: entry.color }}>
                                      {entry.name}: {entry.value?.toLocaleString()} €
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="ventes" fill="#8B5CF6" name="Ventes (€)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="benefice" fill="#06D6A0" name="Bénéfice (€)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="prixAchat" fill="#F59E0B" name="Prix d'achat (€)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Par Catégories */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Répartition des Ventes par Catégorie
                    </CardTitle>
                    <CardDescription>Distribution des ventes par type de produit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="ventes"
                          >
                            {salesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || colors[index % colors.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-semibold">{payload[0].payload.category}</p>
                                    <p style={{ color: payload[0].color }}>
                                      Ventes: {payload[0].value?.toLocaleString()} €
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-emerald-600" />
                      Bénéfices par Catégorie
                    </CardTitle>
                    <CardDescription>Rentabilité par type de produit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByCategory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#64748b" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-semibold">{label}</p>
                                    <p style={{ color: payload[0].color }}>
                                      Bénéfice: {payload[0].value?.toLocaleString()} €
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="benefice" fill="#06D6A0" radius={[4, 4, 0, 0]} name="Bénéfice (€)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommandations */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                    Recommandations d'Achat Intelligentes
                  </CardTitle>
                  <CardDescription>Produits à privilégier pour maximiser vos bénéfices (basé sur le ROI historique)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {buyingRecommendations.map((product, index) => (
                      <div key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-emerald-400"
                            )}></div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">#{index + 1}</h3>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">+{product.roi}%</div>
                            <div className="text-xs text-gray-500">ROI</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2" title={product.fullName}>
                          {product.name}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Bénéfice total:</span>
                            <span className="font-semibold text-emerald-600">{product.benefice.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Bénéfice moyen:</span>
                            <span className="font-semibold text-emerald-500">{product.avgProfit} €</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Prix d'achat:</span>
                            <span className="font-semibold">{(product.prixAchat / product.count).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Vendus:</span>
                            <span className="font-semibold text-blue-600">{product.count}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Catégorie:</span>
                            <span className="font-semibold text-purple-600">{product.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {buyingRecommendations.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Pas encore assez de données pour générer des recommandations.
                        <br />
                        Continuez à enregistrer vos ventes !
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TendancesPage;
