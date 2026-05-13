import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  DollarSign,
  TrendingUp,
  Package,
  BarChart3,
  Warehouse,
  Crown,
  Diamond,
  Sparkles,
  Gem,
  Zap,
  Calendar,
  Target,
  ShoppingCart,
  Box,
  Layers,
} from 'lucide-react';

import useCurrencyFormatter from '@/hooks/use-currency-formatter';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';

interface SalesOverviewSectionProps {
  sales: any[];
  productData: {
    availableProducts: any[];
    totalItems: number;
  };
  currentMonth: number;
  currentYear: number;
}

const monthNames = [
  'JANVIER',
  'FÉVRIER',
  'MARS',
  'AVRIL',
  'MAI',
  'JUIN',
  'JUILLET',
  'AOÛT',
  'SEPTEMBRE',
  'OCTOBRE',
  'NOVEMBRE',
  'DÉCEMBRE',
];

const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  sales,
  productData,
  currentMonth,
  currentYear,
}) => {
  const navigate = useNavigate();
  const { formatEuro } = useCurrencyFormatter();

  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Vérifie si produit = avance
  const isAdvanceProduct = (description: string) => {
    return description?.includes('Avance Perruque ou Tissages');
  };

  // =========================
  // CALCULS
  // =========================

  const totalSellingPrice = useMemo(() => {
    return sales.reduce((sum, sale) => {
      return sum + (sale.totalSellingPrice || sale.sellingPrice || 0);
    }, 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return sales.reduce((sum, sale) => {
      return sum + (sale.totalProfit || sale.profit || 0);
    }, 0);
  }, [sales]);

  const totalQuantitySold = useMemo(() => {
    return sales.reduce((sum, sale) => {
      if (sale.products) {
        return (
          sum +
          sale.products.reduce((productSum: number, product: any) => {
            return (
              productSum +
              (isAdvanceProduct(product.description)
                ? 0
                : product.quantitySold || 0)
            );
          }, 0)
        );
      }

      return (
        sum +
        (isAdvanceProduct(sale.description) ? 0 : sale.quantitySold || 0)
      );
    }, 0);
  }, [sales]);

  // =========================
  // STATS
  // =========================

  const stats = [
    {
      id: 'total-ventes',
      title: 'Total ventes',
      value: formatEuro(totalSellingPrice),
      icon: DollarSign,
      luxeIcon: Crown,
      gradient:
        'from-emerald-500 via-green-500 to-teal-500',
      bgGradient:
        'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      description: 'Chiffre d’affaires',
      modalColor: 'emerald',
    },

    {
      id: 'benefices',
      title: 'Bénéfices',
      value: formatEuro(totalProfit),
      icon: TrendingUp,
      luxeIcon: Diamond,
      gradient:
        'from-purple-500 via-violet-500 to-indigo-500',
      bgGradient:
        'from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30',
      description: 'Profit net',
      modalColor: 'purple',
    },

    {
      id: 'produits-vendus',
      title: 'Produits vendus',
      value: totalQuantitySold.toString(),
      icon: Package,
      luxeIcon: Sparkles,
      gradient:
        'from-blue-500 via-cyan-500 to-sky-500',
      bgGradient:
        'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30',
      description: 'Unités vendues',
      modalColor: 'blue',
    },

    {
      id: 'produits-disponibles',
      title: 'Produits dispo',
      value: productData?.availableProducts?.length?.toString() || '0',
      icon: BarChart3,
      luxeIcon: Gem,
      gradient:
        'from-pink-500 via-rose-500 to-red-500',
      bgGradient:
        'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30',
      description: 'Produits en stock',
      modalColor: 'pink',
    },

    {
      id: 'stock-total',
      title: 'Stock total',
      value: productData?.totalItems?.toString() || '0',
      icon: Warehouse,
      luxeIcon: Zap,
      gradient:
        'from-amber-500 via-orange-500 to-yellow-500',
      bgGradient:
        'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
      description: 'Unités disponibles',
      modalColor: 'amber',
    },
  ];

  // =========================
  // DETAILS MODAL
  // =========================

  const getStatDetails = (statId: string) => {
    const stat = stats.find((s) => s.id === statId);

    if (!stat) return null;

    switch (statId) {
      case 'total-ventes':
        return {
          ...stat,
          details: [
            {
              label: 'Nombre de ventes',
              value: sales.length,
              icon: ShoppingCart,
            },
            {
              label: 'Vente moyenne',
              value: formatEuro(
                sales.length > 0
                  ? totalSellingPrice / sales.length
                  : 0
              ),
              icon: Target,
            },
            {
              label: 'Période',
              value: `${monthNames[currentMonth - 1]} ${currentYear}`,
              icon: Calendar,
            },
          ],
        };

      case 'benefices':
        return {
          ...stat,
          details: [
            {
              label: 'Marge',
              value: `${
                totalSellingPrice > 0
                  ? (
                      (totalProfit / totalSellingPrice) *
                      100
                    ).toFixed(1)
                  : 0
              }%`,
              icon: TrendingUp,
            },
            {
              label: 'Bénéfice moyen',
              value: formatEuro(
                sales.length > 0
                  ? totalProfit / sales.length
                  : 0
              ),
              icon: Target,
            },
            {
              label: 'CA total',
              value: formatEuro(totalSellingPrice),
              icon: DollarSign,
            },
          ],
        };

      case 'produits-vendus':
        return {
          ...stat,
          details: [
            {
              label: 'Unités vendues',
              value: totalQuantitySold,
              icon: Package,
            },
            {
              label: 'Moyenne/vente',
              value:
                sales.length > 0
                  ? (totalQuantitySold / sales.length).toFixed(1)
                  : '0',
              icon: Target,
            },
            {
              label: 'Mois',
              value: `${monthNames[currentMonth - 1]} ${currentYear}`,
              icon: Calendar,
            },
          ],
        };

      case 'produits-disponibles':
        return {
          ...stat,
          details: [
            {
              label: 'Références',
              value: productData.availableProducts.length,
              icon: Box,
            },
            {
              label: 'Stock total',
              value: productData.totalItems,
              icon: Layers,
            },
            {
              label: 'Inventaire',
              value: 'Actif',
              icon: Sparkles,
            },
          ],
        };

      case 'stock-total':
        return {
          ...stat,
          details: [
            {
              label: 'Unités',
              value: productData.totalItems,
              icon: Warehouse,
            },
            {
              label: 'Produits',
              value: productData.availableProducts.length,
              icon: Package,
            },
            {
              label: 'Disponibilité',
              value: 'En stock',
              icon: DollarSign,
            },
          ],
        };

      default:
        return {
          ...stat,
          details: [],
        };
    }
  };

  const selectedStatDetails = selectedStat
    ? getStatDetails(selectedStat)
    : null;

  const getModalGradient = (color: string) => {
    const gradients: Record<string, string> = {
      emerald: 'from-emerald-500 to-teal-600',
      purple: 'from-purple-500 to-indigo-600',
      blue: 'from-blue-500 to-cyan-600',
      pink: 'from-pink-500 to-rose-600',
      amber: 'from-amber-500 to-orange-600',
    };

    return gradients[color] || gradients.emerald;
  };

  // =========================
  // UI
  // =========================

  return (
    <section
      aria-labelledby="sales-overview-title"
      className="w-full space-y-5"
    >
      {/* HEADER */}
      {/* <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/70 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-3 shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>

          <div>
            <h2
              id="sales-overview-title"
              className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl lg:text-3xl"
            >
              Aperçu des ventes
            </h2>

            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 sm:text-base">
              <Sparkles className="h-4 w-4" />
              {monthNames[currentMonth - 1]} {currentYear}
            </p>
          </div>
        </div>

        <Badge className="w-fit rounded-full border-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-white">
          <Diamond className="mr-2 h-4 w-4" />
          Dashboard Premium
        </Badge>
      </motion.div> */}

      {/* GRID RESPONSIVE */}
      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-5
        "
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
            }}
            onClick={() => setSelectedStat(stat.id)}
            className="group"
          >
            <div
              className={`
                relative
                h-full
                cursor-pointer
                overflow-hidden
                rounded-3xl
                border
                border-white/30
                bg-gradient-to-br
                ${stat.bgGradient}
                p-5
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
                dark:border-gray-800
              `}
            >
              {/* Glow */}
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/20 blur-2xl" />

              {/* TOP */}
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`
                    rounded-2xl
                    bg-gradient-to-br
                    ${stat.gradient}
                    p-3
                    text-white
                    shadow-lg
                  `}
                >
                  <stat.icon className="h-6 w-6" />
                </div>

                <stat.luxeIcon className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-500" />
              </div>

              {/* CONTENT */}
              <div className="relative z-10 mt-6">
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                  {stat.title}
                </p>

                <h3
                  className={`
                    mt-2
                    break-words
                    bg-gradient-to-r
                    ${stat.gradient}
                    bg-clip-text
                    text-2xl
                    font-black
                    text-transparent
                    sm:text-3xl
                  `}
                >
                  {stat.value}
                </h3>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  {stat.description}
                </p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-white/5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedStat && selectedStatDetails && (
          <Dialog
            open={!!selectedStat}
            onOpenChange={() => setSelectedStat(null)}
          >
            <DialogContent
              className="
                max-h-[90vh]
                w-[95vw]
                overflow-y-auto
                rounded-3xl
                border-0
                bg-white
                p-0
                shadow-2xl
                dark:bg-gray-900
                sm:max-w-lg
              "
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                }}
                transition={{ duration: 0.25 }}
              >
                {/* HEADER MODAL */}
                <div
                  className={`
                    relative
                    overflow-hidden
                    rounded-t-3xl
                    bg-gradient-to-r
                    ${getModalGradient(
                      selectedStatDetails.modalColor
                    )}
                    p-6
                  `}
                >
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                      <selectedStatDetails.icon className="h-8 w-8 text-white" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white sm:text-2xl">
                        {selectedStatDetails.title}
                      </h3>

                      <p className="mt-1 text-sm text-white/80">
                        {selectedStatDetails.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-5 sm:p-6">
                  {/* MAIN VALUE */}
                  <div className="text-center">
                    <h2
                      className={`
                        bg-gradient-to-r
                        ${selectedStatDetails.gradient}
                        bg-clip-text
                        text-4xl
                        font-black
                        text-transparent
                        sm:text-5xl
                      `}
                    >
                      {selectedStatDetails.value}
                    </h2>

                    <Badge className="mt-4 border-0 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      <Calendar className="mr-1 h-3 w-3" />
                      {monthNames[currentMonth - 1]} {currentYear}
                    </Badge>
                  </div>

                  {/* DETAILS */}
                  <div className="mt-8 space-y-4">
                    {selectedStatDetails.details.map(
                      (detail: any, idx: number) => {
                        const isStockClickable =
                          (selectedStat ===
                            'produits-disponibles' ||
                            selectedStat === 'stock-total') &&
                          [
                            'Références',
                            'Stock total',
                            'Inventaire',
                            'Unités',
                            'Produits',
                          ].includes(detail.label);

                        return (
                          <motion.div
                            key={idx}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: idx * 0.08,
                            }}
                            onClick={() => {
                              if (isStockClickable) {
                                setSelectedStat(null);
                                navigate('/produits');
                              }
                            }}
                            className={`
                              flex
                              items-center
                              justify-between
                              gap-3
                              rounded-2xl
                              bg-gray-50
                              p-4
                              transition-all
                              duration-300
                              dark:bg-gray-800
                              ${
                                isStockClickable
                                  ? 'cursor-pointer hover:scale-[1.02] hover:ring-2 hover:ring-purple-500'
                                  : ''
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  rounded-xl
                                  bg-gradient-to-br
                                  ${selectedStatDetails.gradient}
                                  p-2
                                  text-white
                                `}
                              >
                                <detail.icon className="h-4 w-4" />
                              </div>

                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 sm:text-base">
                                {detail.label}
                              </span>
                            </div>

                            <span
                              className={`
                                bg-gradient-to-r
                                ${selectedStatDetails.gradient}
                                bg-clip-text
                                text-lg
                                font-black
                                text-transparent
                                sm:text-xl
                              `}
                            >
                              {detail.value}
                            </span>
                          </motion.div>
                        );
                      }
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />

                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Dashboard responsive premium
                    </span>

                    <Diamond className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SalesOverviewSection;