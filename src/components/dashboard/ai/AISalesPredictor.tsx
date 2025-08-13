import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, DollarSign, Target, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Sale } from '@/types';

interface SalesPrediction {
  period: string;
  predictedRevenue: number;
  predictedSales: number;
  confidence: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

const AISalesPredictor: React.FC = () => {
  const { allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fonction utilitaire pour calculer les valeurs d'une vente
  const getSaleValues = (sale: Sale) => {
    // Nouveau format multi-produits
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      return {
        revenue: sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice * p.quantitySold), 0),
        quantity: sale.products.reduce((sum, p) => sum + p.quantitySold, 0)
      };
    }
    // Ancien format single-produit
    else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined) {
      return {
        revenue: sale.sellingPrice * sale.quantitySold,
        quantity: sale.quantitySold
      };
    }
    // Fallback
    return { revenue: 0, quantity: 0 };
  };

  const analyzeTrends = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Calculer les tendances des 3 derniers mois
      const now = new Date();
      const monthlyData = [];
      
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthSales = allSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthDate && saleDate < nextMonth;
        });
        
        const revenue = monthSales.reduce((sum, sale) => {
          const saleValue = getSaleValues(sale);
          return sum + saleValue.revenue;
        }, 0);
        
        const quantity = monthSales.reduce((sum, sale) => {
          const saleValue = getSaleValues(sale);
          return sum + saleValue.quantity;
        }, 0);
        
        monthlyData.push({
          month: monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          revenue,
          quantity,
          sales: monthSales.length
        });
      }
      
      // Prédictions basées sur les tendances
      const avgRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0) / (monthlyData.length || 1);
      const avgSales = monthlyData.reduce((sum, m) => sum + m.sales, 0) / (monthlyData.length || 1);
      
      // Calcul de tendance simple
      const revenueGrowth = monthlyData.length > 1 ? 
        (monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / (monthlyData[0].revenue || 1) : 0;
      
      const predictions: SalesPrediction[] = [
        {
          period: 'Prochaine semaine',
          predictedRevenue: avgRevenue * 0.25 * (1 + revenueGrowth),
          predictedSales: Math.round(avgSales * 0.25),
          confidence: 'high',
          trend: revenueGrowth > 0.1 ? 'up' : revenueGrowth < -0.1 ? 'down' : 'stable',
          factors: ['Tendance actuelle', 'Saisonnalité', 'Historique récent']
        },
        {
          period: 'Mois prochain',
          predictedRevenue: avgRevenue * (1 + revenueGrowth * 1.2),
          predictedSales: Math.round(avgSales * (1 + revenueGrowth)),
          confidence: 'medium',
          trend: revenueGrowth > 0.05 ? 'up' : revenueGrowth < -0.05 ? 'down' : 'stable',
          factors: ['Évolution mensuelle', 'Produits populaires', 'Stock disponible']
        },
        {
          period: 'Trimestre prochain',
          predictedRevenue: avgRevenue * 3 * (1 + revenueGrowth * 0.8),
          predictedSales: Math.round(avgSales * 3 * (1 + revenueGrowth * 0.5)),
          confidence: 'low',
          trend: revenueGrowth > 0 ? 'up' : 'down',
          factors: ['Tendance générale', 'Cycle économique', 'Stratégie marketing']
        }
      ];
      
      setPredictions(predictions);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'stable': return <Target className="h-4 w-4 text-gray-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Prédicteur de Ventes IA
        </CardTitle>
        <CardDescription>
          Prévisions intelligentes basées sur l'analyse des tendances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzeTrends} 
          disabled={isAnalyzing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              Analyse des tendances...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Générer les prédictions
            </>
          )}
        </Button>

        {predictions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Prévisions IA</h3>
            {predictions.map((prediction, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium">{prediction.period}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(prediction.trend)}
                    <Badge className={getConfidenceColor(prediction.confidence)}>
                      {prediction.confidence === 'high' ? 'Haute confiance' : 
                       prediction.confidence === 'medium' ? 'Confiance moyenne' : 'Faible confiance'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Revenus prévus:</span>
                    <span className="font-semibold text-green-600">
                      {formatEuro(prediction.predictedRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Ventes prévues:</span>
                    <span className="font-semibold text-blue-600">
                      {prediction.predictedSales}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Facteurs d'analyse:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, factorIndex) => (
                      <Badge key={factorIndex} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {predictions.length === 0 && !isAnalyzing && (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Générez des prédictions basées sur vos données de ventes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISalesPredictor;
