import React from 'react';
import { motion } from 'framer-motion';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import { DollarSign, TrendingUp, Package, BarChart3, Warehouse, Crown, Diamond, Sparkles, Gem, Zap } from 'lucide-react';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface SalesOverviewSectionProps {
  sales: any[];
  productData: any;
  currentMonth: number;
  currentYear: number;
}

const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  sales,
  productData,
  currentMonth,
  currentYear
}) => {
  const { formatEuro } = useCurrencyFormatter();

  // Fonction pour vérifier si le produit est une avance
  const isAdvanceProduct = (description: string) => {
    return description.includes("Avance Perruque ou Tissages");
  };

  // Calculer les totaux comme dans SalesTable
  const totalSellingPrice = sales.reduce((sum, sale) => {
    return sum + (sale.totalSellingPrice || sale.sellingPrice || 0);
  }, 0);

  const totalQuantitySold = sales.reduce((sum, sale) => {
    if (sale.products) {
      return sum + sale.products.reduce((productSum: number, product: any) => {
        return productSum + (isAdvanceProduct(product.description) ? 0 : product.quantitySold);
      }, 0);
    }
    return sum + (isAdvanceProduct(sale.description) ? 0 : sale.quantitySold);
  }, 0);

  const totalProfit = sales.reduce((sum, sale) => {
    return sum + (sale.totalProfit || sale.profit || 0);
  }, 0);

  const stats = [
    {
      title: 'Total ventes du mois',
      value: formatEuro(totalSellingPrice || 0),
      icon: DollarSign,
      luxeIcon: Crown,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      description: 'Chiffre d\'affaires total'
    },
    {
      title: 'Bénéfices du mois',
      value: formatEuro(totalProfit || 0),
      icon: TrendingUp,
      luxeIcon: Diamond,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      description: 'Profit net réalisé'
    },
    {
      title: 'Produits vendus',
      value: (totalQuantitySold || 0).toString(),
      icon: Package,
      luxeIcon: Sparkles,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
      description: 'Unités vendues ce mois'
    },
    {
      title: 'Produits disponibles',
      value: productData.availableProducts.length.toString(),
      icon: BarChart3,
      luxeIcon: Gem,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      description: 'Produits en stock'
    },
    {
      title: 'Stock total',
      value: productData.totalItems.toString(),
      icon: Warehouse,
      luxeIcon: Zap,
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
      description: 'Total des unités en stock'
    }
  ];

  return (
    <section aria-labelledby="sales-overview-title" className="space-y-6">
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
          </div>
          <div>
            <h2
              id="sales-overview-title"
              className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Aperçu des Ventes
            </h2>
            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              {monthNames[currentMonth - 1]} {currentYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
            Premium Dashboard
          </span>
        </div>
      </motion.div>

      {/* Stats Cards Grid Responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bgGradient} p-4 sm:p-5 md:p-6 border-2 border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1`}>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                  </div>
                  <stat.luxeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 opacity-50 group-hover:opacity-100 group-hover:text-purple-500 transition-all animate-pulse" />
                </div>
                
                <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 truncate">
                  {stat.title}
                </p>
                <p 
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  aria-label={`${stat.title}: ${stat.value}`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">
                  {stat.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SalesOverviewSection;
