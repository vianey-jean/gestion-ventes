import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { productService, salesService, marketingService } from '@/service/api';
import { Product, Sale } from '@/types';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Package,
  DollarSign,
  Clock,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading';

interface WeeklySalesAnalysis {
  productId: string;
  description: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  total: number;
  bestWeek: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketingDescription {
  productId: string;
  description: string;
  marketingText: string;
  generatedAt: Date;
}

const AIMarketingAssistant: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklySalesAnalysis[]>([]);
  const [marketingDescriptions, setMarketingDescriptions] = useState<MarketingDescription[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, salesData] = await Promise.all([
        productService.getProducts(),
        salesService.getAllSales(),
      ]);
      setProducts(productsData);
      setSales(salesData);
      analyzeWeeklySales(salesData, productsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeeklySales = (salesData: Sale[], productsData: Product[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthSales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const productSales: Record<string, WeeklySalesAnalysis> = {};

    productsData.forEach(product => {
      productSales[product.id] = {
        productId: product.id,
        description: product.description,
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        total: 0,
        bestWeek: 0,
        trend: 'stable',
      };
    });

    monthSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const dayOfMonth = saleDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      
      const processSaleProduct = (productId: string, quantity: number) => {
        if (productSales[productId]) {
          const weekKey = `week${Math.min(weekNumber, 4)}` as keyof Pick<WeeklySalesAnalysis, 'week1' | 'week2' | 'week3' | 'week4'>;
          productSales[productId][weekKey] += quantity;
          productSales[productId].total += quantity;
        }
      };

      if (sale.products && sale.products.length > 0) {
        sale.products.forEach(product => {
          processSaleProduct(product.productId, product.quantitySold);
        });
      } else if (sale.productId && sale.quantitySold) {
        processSaleProduct(sale.productId, sale.quantitySold);
      }
    });

    const analysis = Object.values(productSales).map(product => {
      const weeks = [product.week1, product.week2, product.week3, product.week4];
      const bestWeek = Math.max(...weeks);
      const bestWeekIndex = weeks.indexOf(bestWeek) + 1;
      
      const trend: 'up' | 'down' | 'stable' = weeks[3] > weeks[0] ? 'up' : weeks[3] < weeks[0] ? 'down' : 'stable';

      return {
        ...product,
        bestWeek: bestWeekIndex,
        trend,
      };
    }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

    setWeeklyAnalysis(analysis);
  };

  const generateMarketingDescription = async (product: Product) => {
    try {
      setGeneratingFor(product.id);
      
      const data = await marketingService.generateDescription({
        productDescription: product.description,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
      });

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const newDescription: MarketingDescription = {
        productId: product.id,
        description: product.description,
        marketingText: data.description || '',
        generatedAt: new Date(),
      };

      setMarketingDescriptions(prev => {
        const filtered = prev.filter(d => d.productId !== product.id);
        return [newDescription, ...filtered];
      });

      toast({
        title: 'Description générée !',
        description: 'La description marketing a été créée avec succès',
      });
    } catch (error: any) {
      console.error('Erreur génération:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer la description',
        variant: 'destructive',
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const copyToClipboard = async (text: string, productId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(productId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copié !',
        description: 'Description copiée dans le presse-papier',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le texte',
        variant: 'destructive',
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <Zap className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      <CardHeader className="border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Assistant Marketing IA
            </CardTitle>
            <CardDescription className="text-base font-medium mt-1">
              Analyse intelligente des ventes et génération automatique de descriptions marketing
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger 
              value="analysis"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-bold"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Analyse Hebdomadaire
            </TabsTrigger>
            <TabsTrigger 
              value="marketing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white font-bold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Descriptions Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {weeklyAnalysis.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                    Aucune vente ce mois-ci
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Les analyses apparaîtront dès que des ventes seront enregistrées
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {weeklyAnalysis.map((analysis) => (
                    <Card 
                      key={analysis.productId}
                      className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                              <Package className="h-5 w-5 text-purple-600" />
                              {analysis.description}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="font-semibold">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {analysis.total} ventes totales
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="font-semibold border-purple-300 text-purple-700 dark:text-purple-300"
                              >
                                {getTrendIcon(analysis.trend)}
                                <span className="ml-1 capitalize">{analysis.trend === 'up' ? 'En hausse' : analysis.trend === 'down' ? 'En baisse' : 'Stable'}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map(weekNum => {
                            const weekKey = `week${weekNum}` as keyof Pick<WeeklySalesAnalysis, 'week1' | 'week2' | 'week3' | 'week4'>;
                            const value = analysis[weekKey];
                            const isBestWeek = analysis.bestWeek === weekNum;
                            
                            return (
                              <div 
                                key={weekNum}
                                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                                  isBestWeek 
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Clock className="h-3 w-3" />
                                  <p className={`text-xs font-bold ${isBestWeek ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    Semaine {weekNum}
                                  </p>
                                </div>
                                <p className={`text-2xl font-black ${isBestWeek ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                  {value}
                                </p>
                                {isBestWeek && (
                                  <Badge className="mt-2 bg-white/20 text-white border-0 text-xs">
                                    🏆 Meilleure
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100 mb-2">
                      Génération de Descriptions Marketing par IA
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Sélectionnez un produit en stock pour générer automatiquement une description marketing optimisée pour les marketplaces.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {/* Produits en stock */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-600" />
                      Produits en Stock
                    </h3>
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Rechercher un produit (min. 3 caractères)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {products
                      .filter(p => p.quantity > 0)
                      .filter(p => {
                        if (searchQuery.length < 3) return true;
                        return p.description.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .map(product => {
                      const existingDescription = marketingDescriptions.find(d => d.productId === product.id);
                      
                      return (
                        <Card 
                          key={product.id}
                          className="hover:shadow-lg transition-all duration-300"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base font-bold">
                                  {product.description}
                                </CardTitle>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary">
                                    Stock: {product.quantity}
                                  </Badge>
                                  {product.sellingPrice && (
                                    <Badge variant="outline">
                                      {product.sellingPrice}€
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => generateMarketingDescription(product)}
                                disabled={generatingFor === product.id}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                              >
                                {generatingFor === product.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Génération...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Générer
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          
                          {/* Afficher la description générée juste en dessous */}
                          {existingDescription && (
                            <CardContent className="pt-0">
                              <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Description Marketing Générée
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(existingDescription.marketingText, product.id)}
                                    className="border-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                  >
                                    {copiedId === product.id ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1 text-green-600" />
                                        Copié !
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copier
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                                  {existingDescription.marketingText}
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 italic">
                                  Généré le {new Date(existingDescription.generatedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIMarketingAssistant;
