
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calculator, FileText, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Button } from '@/components/ui/button';

interface PeriodData {
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
  avgOrderValue: number;
}

const ProfitLossStatement: React.FC = () => {
  const { allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [showDetails, setShowDetails] = useState(false);

  const calculatePeriodData = (period: string): PeriodData => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const revenue = periodSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
    const cost = periodSales.reduce((sum, sale) => sum + sale.purchasePrice, 0);
    const profit = periodSales.reduce((sum, sale) => sum + sale.profit, 0);
    const salesCount = periodSales.length;
    const avgOrderValue = salesCount > 0 ? revenue / salesCount : 0;

    return { revenue, cost, profit, salesCount, avgOrderValue };
  };

  const currentData = calculatePeriodData(selectedPeriod);
  const previousPeriodData = selectedPeriod === 'current-month' 
    ? calculatePeriodData('last-month')
    : calculatePeriodData('current-month');

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const profitMargin = currentData.revenue > 0 ? (currentData.profit / currentData.revenue) * 100 : 0;
  const revenueChange = calculateChange(currentData.revenue, previousPeriodData.revenue);
  const profitChange = calculateChange(currentData.profit, previousPeriodData.profit);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'current-month': return 'Mois en cours';
      case 'last-month': return 'Mois dernier';
      case 'current-quarter': return 'Trimestre en cours';
      case 'current-year': return 'Année en cours';
      default: return 'Période sélectionnée';
    }
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          Compte de Résultat
        </CardTitle>
        <CardDescription>
          Analyse détaillée des revenus, coûts et bénéfices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mois en cours</SelectItem>
              <SelectItem value="last-month">Mois dernier</SelectItem>
              <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
              <SelectItem value="current-year">Année en cours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Masquer détails' : 'Voir détails'}
          </Button>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{getPeriodLabel(selectedPeriod)}</h3>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-700">Chiffre d'Affaires</h4>
              {formatChange(revenueChange)}
            </div>
            <p className="text-2xl font-bold text-blue-900">{formatEuro(currentData.revenue)}</p>
            <p className="text-xs text-blue-600">{currentData.salesCount} ventes</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-red-700">Coûts d'Achat</h4>
            </div>
            <p className="text-2xl font-bold text-red-900">{formatEuro(currentData.cost)}</p>
            <p className="text-xs text-red-600">
              {currentData.revenue > 0 ? ((currentData.cost / currentData.revenue) * 100).toFixed(1) : 0}% du CA
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-700">Bénéfice Net</h4>
              {formatChange(profitChange)}
            </div>
            <p className="text-2xl font-bold text-green-900">{formatEuro(currentData.profit)}</p>
            <p className="text-xs text-green-600">Marge: {profitMargin.toFixed(1)}%</p>
          </div>
        </div>

        {/* Métriques détaillées */}
        {showDetails && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Métriques Détaillées</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Panier Moyen</p>
                  <p className="text-lg font-semibold">{formatEuro(currentData.avgOrderValue)}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Marge Brute</p>
                  <p className="text-lg font-semibold">{profitMargin.toFixed(1)}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Coût/Vente</p>
                  <p className="text-lg font-semibold">
                    {formatEuro(currentData.salesCount > 0 ? currentData.cost / currentData.salesCount : 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Profit/Vente</p>
                  <p className="text-lg font-semibold">
                    {formatEuro(currentData.salesCount > 0 ? currentData.profit / currentData.salesCount : 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Analyse de performance */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Analyse de Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Rentabilité</span>
                  <Badge className={profitMargin > 20 ? 'bg-green-100 text-green-800' : 
                                   profitMargin > 10 ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                    {profitMargin > 20 ? 'Excellente' : profitMargin > 10 ? 'Bonne' : 'À améliorer'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Évolution du CA</span>
                  <Badge className={revenueChange > 10 ? 'bg-green-100 text-green-800' : 
                                   revenueChange > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                    {revenueChange > 10 ? 'Forte croissance' : 
                     revenueChange > 0 ? 'Croissance modérée' : 'En baisse'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Volume de ventes</span>
                  <Badge className={currentData.salesCount > 20 ? 'bg-green-100 text-green-800' : 
                                   currentData.salesCount > 10 ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                    {currentData.salesCount > 20 ? 'Élevé' : 
                     currentData.salesCount > 10 ? 'Modéré' : 'Faible'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitLossStatement;
