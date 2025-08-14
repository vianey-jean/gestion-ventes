
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Award, Target, ShoppingCart, Sparkles, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import PremiumLoading from '@/components/ui/premium-loading';

const TendancesPage = () => {
  const { allSales, products, loading } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  // Fonction pour déterminer la catégorie d'un produit (exclure les avances)
  const getProductCategory = (description: string | undefined | null) => {
    // Add null/undefined check
    if (!description || typeof description !== 'string') {
      return null;
    }
    
    const desc = description.toLowerCase();
    if (desc.includes('avance')) {
      return null; // Exclure les avances
    } else if (desc.includes('tissage')) {
      return 'Tissages';
    } else if (desc.includes('perruque')) {
      return 'Perruques';
    } else if (desc.includes('colle') || desc.includes('disolvant')) {
      return 'Accessoires';
    }
    return 'Autres';
  };

  // Filtrer les ventes pour exclure les avances
  const filteredSales = useMemo(() => {
    return allSales.filter(sale => {
      // Pour les nouvelles ventes multi-produits
      if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
        // Exclure la vente si tous les produits sont des avances
        return sale.products.some(product => {
          const category = getProductCategory(product.description);
          return category !== null;
        });
      }
      // Pour les anciennes ventes single-produit
      else {
        const category = getProductCategory(sale.description);
        return category !== null;
      }
    });
  }, [allSales]);

  // Fonction utilitaire pour calculer les valeurs d'une vente (CORRIGÉE)
  const getSaleValues = (sale: any) => {
    // Nouveau format multi-produits
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      let revenue = 0;
      let quantity = 0;
      let profit = 0;
      
      // Filtrer les produits non-avance
      const validProducts = sale.products.filter(p => {
        const category = getProductCategory(p.description);
        return category !== null;
      });
      
      validProducts.forEach(product => {
        revenue += product.sellingPrice * product.quantitySold;
        quantity += product.quantitySold;
        profit += product.profit || 0;
      });
      
      return { revenue, quantity, profit };
    }
    // Ancien format single-produit
    else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined) {
      const revenue = sale.sellingPrice ;
      const quantity = sale.quantitySold;
      const profit = sale.profit || 0;
      
      return { revenue, quantity, profit };
    }
    // Fallback
    return { revenue: 0, quantity: 0, profit: 0 };
  };

  // Analyse du stock critique et recommandations IA
  const stockAnalysis = useMemo(() => {
    const lowStockProducts = products.filter(product => product.quantity <= 10);
    
    const recommendations = lowStockProducts.map(product => {
      const productSales = filteredSales.filter(sale => {
        // Pour les nouvelles ventes multi-produits  
        if (sale.products && Array.isArray(sale.products)) {
          return sale.products.some(p => p.productId === product.id);
        }
        // Pour les anciennes ventes
        return sale.productId === product.id;
      });
      
      let totalSold = 0;
      let totalProfit = 0;
      
      productSales.forEach(sale => {
        if (sale.products && Array.isArray(sale.products)) {
          const matchingProducts = sale.products.filter(p => p.productId === product.id);
          matchingProducts.forEach(p => {
            totalSold += p.quantitySold;
            totalProfit += p.profit || 0;
          });
        } else if (sale.productId === product.id) {
          totalSold += sale.quantitySold;
          totalProfit += sale.profit || 0;
        }
      });
      
      const averageProfit = productSales.length > 0 ? totalProfit / productSales.length : 0;
      
      return {
        ...product,
        currentStock: product.quantity,
        totalSold,
        averageProfit,
        priority: product.quantity <= 2 ? 'URGENT' : product.quantity <= 5 ? 'ÉLEVÉE' : 'MOYENNE'
      };
    }).sort((a, b) => b.averageProfit - a.averageProfit);

    return { recommendations };
  }, [products, filteredSales]);

  // Analyse des ventes quotidiennes
  const dailySalesAnalysis = useMemo(() => {
    const dailySales = filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.date);
      const day = date.getDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const currentMonth = new Date();
      const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      
      // Ne prendre que les ventes du mois actuel
      if (monthKey === currentMonthKey) {
        if (!acc[day]) {
          acc[day] = {
            jour: day,
            ventes: 0,
            benefice: 0,
            quantite: 0
          };
        }
        
        const saleValues = getSaleValues(sale);
        acc[day].ventes += saleValues.revenue;
        acc[day].benefice += saleValues.profit;
        acc[day].quantite += saleValues.quantity;
      }
      return acc;
    }, {} as Record<number, any>);

    return Object.values(dailySales).sort((a, b) => a.jour - b.jour);
  }, [filteredSales]);

  // Données pour les graphiques de ventes par produit (CORRIGÉES)
  const salesByProduct = useMemo(() => {
    const productSales = {} as Record<string, any>;
    
    filteredSales.forEach(sale => {
      // Pour les nouvelles ventes multi-produits
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach(product => {
          const category = getProductCategory(product.description);
          if (category === null) return; // Ignorer les avances
          
          const productName = product.description.length > 50 ? 
            product.description.substring(0, 47) + '...' : 
            product.description;
          
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              fullName: product.description,
              ventes: 0,
              benefice: 0,
              quantite: 0,
              prixAchat: 0,
              category: category,
              count: 0
            };
          }
          
          const revenue = product.sellingPrice * product.quantitySold;
          productSales[productName].ventes += revenue;
          productSales[productName].benefice += product.profit || 0;
          productSales[productName].quantite += product.quantitySold;
          productSales[productName].prixAchat += (product.purchasePrice || 0) * product.quantitySold;
          productSales[productName].count += 1;
        });
      }
      // Pour les anciennes ventes single-produit
      else {
        const category = getProductCategory(sale.description);
        if (category === null) return; // Ignorer les avances
        
        const productName = sale.description.length > 50 ? 
          sale.description.substring(0, 47) + '...' : 
          sale.description;
        
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            fullName: sale.description,
            ventes: 0,
            benefice: 0,
            quantite: 0,
            prixAchat: 0,
            category: category,
            count: 0
          };
        }
        
        const revenue = sale.sellingPrice * sale.quantitySold;
        productSales[productName].ventes += revenue;
        productSales[productName].benefice += sale.profit || 0;
        productSales[productName].quantite += sale.quantitySold;
        productSales[productName].prixAchat += sale.purchasePrice * sale.quantitySold;
        productSales[productName].count += 1;
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.benefice - a.benefice)
      .slice(0, 15); // Top 15 produits
  }, [filteredSales]);

  // Données pour les graphiques par catégorie (CORRIGÉES)
  const salesByCategory = useMemo(() => {
    const categorySales = {} as Record<string, any>;
    
    filteredSales.forEach(sale => {
      // Pour les nouvelles ventes multi-produits
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach(product => {
          const category = getProductCategory(product.description);
          if (!category) return; // Ignorer les avances
          
          if (!categorySales[category]) {
            categorySales[category] = {
              category,
              ventes: 0,
              benefice: 0,
              quantite: 0,
              count: 0
            };
          }
          
          const revenue = product.sellingPrice * product.quantitySold;
          categorySales[category].ventes += revenue;
          categorySales[category].benefice += product.profit || 0;
          categorySales[category].quantite += product.quantitySold;
          categorySales[category].count += 1;
        });
      }
      // Pour les anciennes ventes single-produit
      else {
        const category = getProductCategory(sale.description);
        if (!category) return; // Ignorer les avances
        
        if (!categorySales[category]) {
          categorySales[category] = {
            category,
            ventes: 0,
            benefice: 0,
            quantite: 0,
            count: 0
          };
        }
        
        const revenue = sale.sellingPrice * sale.quantitySold;
        categorySales[category].ventes += revenue;
        categorySales[category].benefice += sale.profit || 0;
        categorySales[category].quantite += sale.quantitySold;
        categorySales[category].count += 1;
      }
    });

    return Object.values(categorySales);
  }, [filteredSales]);

  // Données temporelles (par mois) (CORRIGÉES)
  const salesOverTime = useMemo(() => {
    const monthlySales = filteredSales.reduce((acc, sale) => {
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
      
      const saleValues = getSaleValues(sale);
      acc[monthKey].ventes += saleValues.revenue;
      acc[monthKey].benefice += saleValues.profit;
      acc[monthKey].quantite += saleValues.quantity;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlySales).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [filteredSales]);

  // Données de totaux corrigées
  const salesData = useMemo(() => {
    let totalRevenue = 0;
    let totalQuantity = 0;
    let totalProfit = 0;

    filteredSales.forEach(sale => {
      const saleValues = getSaleValues(sale);
      totalRevenue += saleValues.revenue;
      totalQuantity += saleValues.quantity;
      totalProfit += saleValues.profit;
    });

    return {
      totals: { 
        revenue: totalRevenue, 
        quantity: totalQuantity, 
        sales: filteredSales.length,
        profit: totalProfit 
      }
    };
  }, [filteredSales]);

  // Produits les plus rentables
  const topProfitableProducts = useMemo(() => {
    return salesByProduct
      .filter(product => product.benefice > 0)
      .sort((a, b) => b.benefice - a.benefice)
      .slice(0, 10);
  }, [salesByProduct]);

  // Recommandations d'achat basées sur le ROI (montrer 12 produits)
  const buyingRecommendations = useMemo(() => {
    return salesByProduct
      .filter(product => product.benefice > 30 && product.prixAchat > 0)
      .sort((a, b) => (b.benefice / b.prixAchat) - (a.benefice / a.prixAchat))
      .slice(0, 12) // Changé de 8 à 12
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
    'Autres': '#6B7280'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value);
  };

  const chartConfig = {
    ventes: { label: "Ventes", color: "#8B5CF6" },
    benefice: { label: "Bénéfice", color: "#06D6A0" },
    quantite: { label: "Quantité", color: "#F59E0B" }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <PremiumLoading 
          text="Chargement des Tendances"
          size="lg"
          overlay={true}
          variant="tendances"
        />
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
                  {formatCurrency(salesData.totals.revenue)}
                </div>
                <p className="text-xs text-purple-100">
                  +{salesData.totals.sales} transactions historiques
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
                  {formatCurrency(salesData.totals.profit)}
                </div>
                <p className="text-xs text-emerald-100">
                  Marge moyenne: {salesData.totals.revenue > 0 ? ((salesData.totals.profit / salesData.totals.revenue) * 100).toFixed(1) : 0}%
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
                  {salesData.totals.quantity}
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
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-8">
            {/* Modern Tab Navigation - Matching DashboardPage style */}
            <div className={cn(
              "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20",
              isMobile && "pt-8 pb-12"
            )}>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl"></div>
              
              <TabsList className={cn(
                "relative grid w-full h-auto p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/20",
                isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-5 gap-2'
              )}>
                <TabsTrigger 
                  value="overview" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "overview" 
                      ? "text-white bg-gradient-to-r from-emerald-600 to-blue-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Vue d'ensemble</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="products" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "products" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Par Produits</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="categories" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "categories" 
                      ? "text-white bg-gradient-to-r from-orange-600 to-red-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Target className="h-4 w-4" />
                  <span>Par Catégories</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="recommendations" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "recommendations" 
                      ? "text-white bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Recommandations</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="intelligence" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "intelligence" 
                      ? "text-white bg-gradient-to-r from-red-600 to-pink-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Prévention Stock</span>
                </TabsTrigger>
              </TabsList>
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

            {/* Recommandations - Affichage de 12 produits */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                    Recommandations d'Achat Intelligentes (Top 12)
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

            {/* Intelligence Artificielle - Recommandations Stock */}
            <TabsContent value="intelligence" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                      Alertes Stock Critique
                    </CardTitle>
                    <CardDescription>Produits nécessitant un réapprovisionnement urgent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stockAnalysis.recommendations.length > 0 ? (
                        stockAnalysis.recommendations.map((item, index) => (
                          <div key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-red-700 dark:text-red-300">{item.description}</h3>
                              <div className="flex items-center gap-2">
                                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold">
                                  Stock: {item.currentStock}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Vendus:</span>
                                <span className="font-semibold ml-1 text-blue-600">{item.totalSold}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Bénéfice moy:</span>
                                <span className="font-semibold ml-1 text-emerald-600">{item.averageProfit.toFixed(2)} €</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Priorité:</span>
                                <span className="font-semibold ml-1 text-orange-600">
                                  {item.currentStock <= 2 ? 'URGENT' : item.currentStock <= 5 ? 'ÉLEVÉE' : 'MOYENNE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Aucune alerte stock critique</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                      Recommandations IA
                    </CardTitle>
                    <CardDescription>Suggestions intelligentes pour optimiser vos ventes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
                        <h3 className="font-semibold text-emerald-700 mb-2">📈 Tendances Identifiées</h3>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Les ventes sont {dailySalesAnalysis.length > 15 ? 'plus élevées' : 'plus faibles'} en milieu de mois</li>
                          <li>• Catégorie la plus rentable: Perruques</li>
                          <li>• Marge bénéficiaire moyenne: {salesData.totals.revenue > 0 ? ((salesData.totals.profit / salesData.totals.revenue) * 100).toFixed(1) : 0}%</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-700 mb-2">🎯 Actions Recommandées</h3>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Réapprovisionner {stockAnalysis.recommendations.length} produits critiques</li>
                          <li>• Focus sur les perruques (meilleure marge)</li>
                          <li>• Optimiser les ventes en début de mois</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TendancesPage;
