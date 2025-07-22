
import React from 'react';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import { DollarSign, TrendingUp, Package, BarChart3, Warehouse } from 'lucide-react';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface SalesOverviewSectionProps {
  salesData: any;
  productData: any;
  currentMonth: number;
  currentYear: number;
}

const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  salesData,
  productData,
  currentMonth,
  currentYear
}) => {
  const { formatEuro } = useCurrencyFormatter();

  const stats = [
    {
      title: 'Total ventes du mois',
      value: formatEuro(salesData.totalRevenue),
      icon: DollarSign,
      gradient: 'blue',
      description: 'Chiffre d\'affaires total'
    },
    {
      title: 'Bénéfices du mois',
      value: formatEuro(salesData.totalProfit),
      icon: TrendingUp,
      gradient: 'green',
      description: 'Profit net réalisé'
    },
    {
      title: 'Produits vendus',
      value: salesData.totalQuantity.toString(),
      icon: Package,
      gradient: 'blue',
      description: 'Unités vendues ce mois'
    },
    {
      title: 'Produits disponibles',
      value: productData.availableProducts.length.toString(),
      icon: BarChart3,
      gradient: 'purple',
      description: 'Produits en stock'
    },
    {
      title: 'Stock total',
      value: productData.totalItems.toString(),
      icon: Warehouse,
      gradient: 'orange',
      description: 'Total des unités en stock'
    }
  ];

  return (
    <section aria-labelledby="sales-overview-title">
      <h2 id="sales-overview-title" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Aperçu des Ventes - {monthNames[currentMonth - 1]} {currentYear}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <ModernContainer 
            key={stat.title}
            gradient={stat.gradient as any}
            className="transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full bg-gradient-to-br from-${stat.gradient}-500 to-${stat.gradient}-600 text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p 
                  className="text-2xl font-bold text-gray-700 dark:text-gray-300"
                  aria-label={`${stat.title}: ${stat.value}`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </ModernContainer>
        ))}
      </div>
    </section>
  );
};

export default SalesOverviewSection;
