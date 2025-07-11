
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Package, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';

interface StockRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedAction: 'restock' | 'reduce' | 'maintain';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedQuantity?: number;
}

const AIStockManager: React.FC = () => {
  const { products, allSales } = useApp();
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeStock = () => {
    setIsAnalyzing(true);
    
    // Simuler une analyse IA des stocks
    setTimeout(() => {
      const newRecommendations: StockRecommendation[] = products.map(product => {
        // Calculer les ventes des 30 derniers jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSales = allSales.filter(sale => 
          sale.productId === product.id && 
          new Date(sale.date) >= thirtyDaysAgo
        );
        
        const totalSold = recentSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        const avgDailySales = totalSold / 30;
        const daysOfStock = product.quantity / (avgDailySales || 0.1);
        
        // Logique de recommandation IA
        if (product.quantity === 0) {
          return {
            productId: product.id,
            productName: product.description,
            currentStock: product.quantity,
            recommendedAction: 'restock' as const,
            priority: 'high' as const,
            reason: 'Stock épuisé - Perte de ventes potentielles',
            suggestedQuantity: Math.max(10, Math.ceil(avgDailySales * 30))
          };
        } else if (daysOfStock < 7) {
          return {
            productId: product.id,
            productName: product.description,
            currentStock: product.quantity,
            recommendedAction: 'restock' as const,
            priority: 'high' as const,
            reason: `Stock faible - Seulement ${Math.ceil(daysOfStock)} jours restants`,
            suggestedQuantity: Math.ceil(avgDailySales * 45)
          };
        } else if (daysOfStock < 14) {
          return {
            productId: product.id,
            productName: product.description,
            currentStock: product.quantity,
            recommendedAction: 'restock' as const,
            priority: 'medium' as const,
            reason: `Stock modéré - ${Math.ceil(daysOfStock)} jours de stock`,
            suggestedQuantity: Math.ceil(avgDailySales * 30)
          };
        } else if (daysOfStock > 90 && totalSold === 0) {
          return {
            productId: product.id,
            productName: product.description,
            currentStock: product.quantity,
            recommendedAction: 'reduce' as const,
            priority: 'low' as const,
            reason: 'Aucune vente récente - Considérer une promotion',
          };
        } else {
          return {
            productId: product.id,
            productName: product.description,
            currentStock: product.quantity,
            recommendedAction: 'maintain' as const,
            priority: 'low' as const,
            reason: `Stock optimal - ${Math.ceil(daysOfStock)} jours de couverture`,
          };
        }
      });
      
      // Trier par priorité
      const sortedRecommendations = newRecommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      setRecommendations(sortedRecommendations);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'restock': return <TrendingUp className="h-4 w-4" />;
      case 'reduce': return <TrendingDown className="h-4 w-4" />;
      case 'maintain': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Gestionnaire de Stock IA
        </CardTitle>
        <CardDescription>
          Analyse intelligente des stocks avec recommandations automatiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzeStock} 
          disabled={isAnalyzing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyser les stocks
            </>
          )}
        </Button>

        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Recommandations IA</h3>
            {recommendations.map(rec => (
              <div key={rec.productId} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate flex-1 mr-2">{rec.productName}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getActionIcon(rec.recommendedAction)}
                  <span>Stock actuel: {rec.currentStock}</span>
                  {rec.suggestedQuantity && (
                    <span>• Recommandé: +{rec.suggestedQuantity}</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700">{rec.reason}</p>
                
                {rec.recommendedAction === 'restock' && rec.suggestedQuantity && (
                  <Button size="sm" variant="outline" className="mt-2">
                    Commander {rec.suggestedQuantity} unités
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && !isAnalyzing && (
          <div className="text-center text-gray-500 py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Cliquez sur "Analyser les stocks" pour obtenir des recommandations IA</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStockManager;
