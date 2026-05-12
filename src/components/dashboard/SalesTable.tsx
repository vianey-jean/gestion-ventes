import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from '@/components/ui/table';

import {
  ModernTable,
  ModernTableHeader,
  ModernTableRow,
  ModernTableHead,
  ModernTableCell,
} from '@/components/dashboard/forms/ModernTable';

import { Sale } from '@/types';

import {
  Package,
  Calendar,
  Sparkles,
  Award,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import { realtimeService } from '@/services/realtimeService';

import PremiumLoading from '@/components/ui/premium-loading';

import { Button } from '@/components/ui/button';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

/**
 * =========================================================
 * SALES TABLE PREMIUM ULTRA COMPLETE
 * - Totaux par jour
 * - Totaux globaux
 * - Temps réel
 * - Tri des dates
 * - Groupement journalier
 * =========================================================
 */

const SalesTable: React.FC<SalesTableProps> = ({
  sales: initialSales,
  onRowClick,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);

  const [lastUpdate, setLastUpdate] =
    useState<Date>(new Date());

  const [isRealtimeActive, setIsRealtimeActive] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState<
    'asc' | 'desc'
  >('asc');

  const [collapsedDays, setCollapsedDays] =
    useState<Record<string, boolean>>({});

  // =========================================================
  // FILTER CURRENT MONTH
  // =========================================================

  const filterCurrentMonthSales = (
    salesData: Sale[]
  ) => {
    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();

    return salesData.filter((sale) => {
      const saleDate = new Date(sale.date);

      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      );
    });
  };

  const currentMonthSales = useMemo(() => {
    return filterCurrentMonthSales(initialSales);
  }, [initialSales]);

  // =========================================================
  // REALTIME
  // =========================================================

  useEffect(() => {
    setSales(currentMonthSales);
    if (currentMonthSales.length > 0) {
      setIsLoading(false);
    }

    realtimeService.connect();

    const unsubscribeData =
      realtimeService.addDataListener((data) => {
        if (data.sales) {
          const filteredSales =
            filterCurrentMonthSales(data.sales);

          setSales(filteredSales);
          setIsLoading(false);
          setLastUpdate(new Date());
        }
      });

    const unsubscribeSync =
      realtimeService.addSyncListener((event) => {
        if (event.type === 'connected') {
          setIsRealtimeActive(true);
        } else if (
          event.type === 'data-changed' &&
          event.data?.type === 'sales'
        ) {
          if (event.data.data) {
            const filteredSales =
              filterCurrentMonthSales(
                event.data.data
              );

            setSales(filteredSales);
          }

          setLastUpdate(new Date());
        }
      });

    setIsRealtimeActive(
      realtimeService.getConnectionStatus()
    );

    // Fallback: arrête le loader si aucune donnée n'arrive (mois vide)
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeData();
      unsubscribeSync();
    };
  }, [currentMonthSales]);

  // =========================================================
  // UPDATE SALES
  // =========================================================

  useEffect(() => {
    setSales(currentMonthSales);
  }, [currentMonthSales]);

  // =========================================================
  // LOADING
  // =========================================================

  // Chargement instantané : pas de délai artificiel

  // =========================================================
  // SORT
  // =========================================================

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) =>
      prevOrder === 'asc' ? 'desc' : 'asc'
    );
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount) || 0);
  };

  const isAdvanceProduct = (
    description: string
  ) => {
    return description.includes(
      'Avance Perruque ou Tissages'
    );
  };

  const isRefundSale = (sale: Sale) => {
    return (
      (sale as any).isRefund ||
      (sale.totalSellingPrice ??
        sale.sellingPrice ??
        0) < 0
    );
  };

  const normalizeQuantityForDisplay = (
    quantity: number,
    sale: Sale
  ) => {
    return isRefundSale(sale)
      ? -Math.abs(quantity || 0)
      : quantity || 0;
  };

  // =========================================================
  // SORTED SALES
  // =========================================================

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      const dateA = new Date(a.date).getTime();

      const dateB = new Date(b.date).getTime();

      return sortOrder === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });
  }, [sales, sortOrder]);

  // =========================================================
  // GROUP SALES BY DAY
  // =========================================================

  const groupedSales = useMemo(() => {
    const groups: Record<string, Sale[]> = {};

    sortedSales.forEach((sale) => {
      const day = formatDate(sale.date);

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(sale);
    });

    return groups;
  }, [sortedSales]);

  // =========================================================
  // TOTALS HELPERS
  // =========================================================

  const calculateSaleQuantity = (sale: Sale) => {
    if (sale.products) {
      return sale.products.reduce(
        (sum, product) => {
          const quantity =
            isAdvanceProduct(
              product.description
            )
              ? 0
              : product.quantitySold || 0;

          return (
            sum +
            normalizeQuantityForDisplay(
              quantity,
              sale
            )
          );
        },
        0
      );
    }

    const quantity = isAdvanceProduct(
      sale.description || ''
    )
      ? 0
      : sale.quantitySold || 0;

    return normalizeQuantityForDisplay(
      quantity,
      sale
    );
  };

  // =========================================================
  // GLOBAL TOTALS
  // =========================================================

  const globalTotals = useMemo(() => {
    return sortedSales.reduce(
      (acc, sale) => {
        acc.sales +=
          sale.totalSellingPrice ||
          sale.sellingPrice ||
          0;

        acc.purchase +=
          sale.totalPurchasePrice ||
          sale.purchasePrice ||
          0;

        acc.profit +=
          sale.totalProfit ||
          sale.profit ||
          0;

        if (sale.products) {
          acc.delivery += sale.products.reduce(
            (sum, product) =>
              sum +
              (product.deliveryFee || 0),
            0
          );
        } else {
          acc.delivery +=
            sale.deliveryFee || 0;
        }

        acc.quantity +=
          calculateSaleQuantity(sale);

        return acc;
      },
      {
        sales: 0,
        purchase: 0,
        profit: 0,
        delivery: 0,
        quantity: 0,
      }
    );
  }, [sortedSales]);

  // =========================================================
  // MONTH NAME
  // =========================================================

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString(
      'fr-FR',
      {
        month: 'long',
        year: 'numeric',
      }
    );
  };

  // =========================================================
  // COLLAPSE DAY
  // =========================================================

  const toggleDay = (day: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <PremiumLoading
        text="Chargement des ventes"
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="relative overflow-hidden border-b border-white/50 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 p-7">

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          {/* LEFT */}

          <div className="flex items-center gap-5">

            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/30 bg-white/20">

              <Award className="h-10 w-10 text-white" />

            </div>

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white">

                  Dashboard Premium

                </div>

                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 ${isRealtimeActive
                    ? 'bg-emerald-400/20 text-white'
                    : 'bg-red-400/20 text-white'
                    }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${isRealtimeActive
                      ? 'animate-pulse bg-green-300'
                      : 'bg-red-300'
                      }`}
                  />

                  <span className="text-xs font-semibold">
                    {isRealtimeActive
                      ? 'Temps réel'
                      : 'Hors ligne'}
                  </span>
                </div>
              </div>

              <h2 className="text-4xl font-black tracking-tight text-white">
                Ventes {getCurrentMonthName()}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-white/90">

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />

                  {lastUpdate.toLocaleTimeString(
                    'fr-FR'
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />

                  {globalTotals.quantity} produits
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />

                  Synchronisation active
                </div>
              </div>
            </div>
          </div>

          {/* KPI */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">

            <div className="rounded-3xl bg-white/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Chiffre A
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                {formatCurrency(
                  globalTotals.sales
                )}
              </h3>
            </div>

            <div className="rounded-3xl bg-white/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Bénefice
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                {formatCurrency(
                  globalTotals.profit
                )}
              </h3>
            </div>

            <div className="rounded-3xl bg-white/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Prix Achat
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                {formatCurrency(
                  globalTotals.purchase
                )}
              </h3>
            </div>

            <div className="rounded-3xl bg-white/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Quantité
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                {globalTotals.quantity}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABLE */}
      {/* ========================================================= */}

      <div className="max-h-[75vh] overflow-auto">

        <ModernTable>

          {/* HEADER */}

          <ModernTableHeader className="sticky top-0 z-20">

            <TableRow className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">

              <ModernTableHead>
                <div className="flex items-center gap-3">

                  <Calendar className="h-4 w-4 text-violet-500" />

                  Date

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="h-7 w-7 rounded-full p-0"
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </ModernTableHead>

              <ModernTableHead>
                Description Produit
              </ModernTableHead>

              <ModernTableHead className="text-right">
                Prix Vente
              </ModernTableHead>

              <ModernTableHead className="text-right">
                Qté
              </ModernTableHead>

              <ModernTableHead className="text-right">
                Prix Achat
              </ModernTableHead>

              <ModernTableHead className="text-right">
                Livraison
              </ModernTableHead>

              <ModernTableHead className="text-right">
                Bénefice
              </ModernTableHead>

            </TableRow>

          </ModernTableHeader>

          {/* BODY */}

          <TableBody>

            {Object.entries(groupedSales).map(
              ([day, daySales]) => {

                const isCollapsed =
                  collapsedDays[day];

                // DAILY TOTALS

                const dailyTotals =
                  daySales.reduce(
                    (acc, sale) => {
                      acc.sales +=
                        sale.totalSellingPrice ||
                        sale.sellingPrice ||
                        0;

                      acc.purchase +=
                        sale.totalPurchasePrice ||
                        sale.purchasePrice ||
                        0;

                      acc.profit +=
                        sale.totalProfit ||
                        sale.profit ||
                        0;

                      if (sale.products) {
                        acc.delivery +=
                          sale.products.reduce(
                            (sum, product) =>
                              sum +
                              (product.deliveryFee ||
                                0),
                            0
                          );
                      } else {
                        acc.delivery +=
                          sale.deliveryFee || 0;
                      }

                      acc.quantity +=
                        calculateSaleQuantity(
                          sale
                        );

                      return acc;
                    },
                    {
                      sales: 0,
                      purchase: 0,
                      profit: 0,
                      delivery: 0,
                      quantity: 0,
                    }
                  );

                return (
                  <React.Fragment key={day}>

                    {/* ========================================================= */}
                    {/* DAILY HEADER ROW */}
                    {/* ========================================================= */}

                    <TableRow className="sticky top-[56px] z-10 bg-gradient-to-r from-violet-100 to-cyan-50 border-y border-violet-200">

                      {/* DATE / TOGGLE */}
                      <TableCell className="font-black text-violet-800">
                        <button
                          onClick={() => toggleDay(day)}
                          className="flex items-center gap-2"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}

                          {day}
                        </button>
                      </TableCell>

                      {/* DESCRIPTION EMPTY */}
                      <TableCell
                        className="font-black text-red-600 text-center"
                      >
                        TOTAL
                      </TableCell>

                      {/* VENTE */}
                      <TableCell className="text-right font-black text-red-600">
                        {formatCurrency(dailyTotals.sales)}
                      </TableCell>

                      {/* QUANTITÉ */}
                      <TableCell className="text-right font-black text-red-600">
                        {dailyTotals.quantity}
                      </TableCell>

                      {/* ACHAT */}
                      <TableCell className="text-right font-black text-red-600">
                        {formatCurrency(dailyTotals.purchase)}
                      </TableCell>

                      {/* LIVRAISON */}
                      <TableCell className="text-right font-black text-red-600">
                        {formatCurrency(dailyTotals.delivery)}
                      </TableCell>

                      {/* PROFIT */}
                      <TableCell className="text-right font-black text-red-600">
                        {formatCurrency(dailyTotals.profit)}
                      </TableCell>

                    </TableRow>

                    {/* ========================================================= */}
                    {/* SALES ROWS */}
                    {/* ========================================================= */}

                    {!isCollapsed &&
                      daySales.map((sale, index) => {
                        const isRefund = isRefundSale(sale);

                        return (
                          <ModernTableRow
                            key={sale.id}
                            onClick={() => onRowClick(sale)}
                            className={`cursor-pointer transition-all duration-300 hover:bg-violet-50/60 ${isRefund ? 'bg-red-50/40' : ''
                              }`}
                          >

                            {/* DATE */}
                            <ModernTableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-700">
                                  {index + 1}
                                </div>

                                <span className="font-bold">
                                  {formatDate(sale.date)}
                                </span>
                              </div>
                            </ModernTableCell>

                            {/* DESCRIPTION */}
                            <ModernTableCell>
                              {sale.products ? (
                                <div className="space-y-2">
                                  {sale.products.map((product, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-xl bg-slate-50 px-3 py-2 font-bold"
                                    >
                                      {product.description}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-xl bg-slate-50 px-3 py-2 font-bold">
                                  {sale.description}
                                </div>
                              )}
                            </ModernTableCell>

                            {/* VENTE */}
                            <ModernTableCell className="text-right font-black text-emerald-700">
                              {formatCurrency(
                                sale.totalSellingPrice ?? sale.sellingPrice ?? 0
                              )}
                            </ModernTableCell>

                            {/* QUANTITY */}
                            <ModernTableCell className="text-right font-bold">
                              {calculateSaleQuantity(sale)}
                            </ModernTableCell>

                            {/* ACHAT */}
                            <ModernTableCell className="text-right font-black text-cyan-700">
                              {formatCurrency(
                                sale.totalPurchasePrice ?? sale.purchasePrice ?? 0
                              )}
                            </ModernTableCell>

                            {/* LIVRAISON */}
                            <ModernTableCell className="text-right font-black text-blue-700">
                              {formatCurrency(sale.deliveryFee || 0)}
                            </ModernTableCell>

                            {/* PROFIT */}
                            <ModernTableCell className="text-right font-black text-orange-700">
                              {formatCurrency(
                                sale.totalProfit ?? sale.profit ?? 0
                              )}
                            </ModernTableCell>

                          </ModernTableRow>
                        );
                      })}

                  </React.Fragment>
                );
              }
            )}

          </TableBody>

          {/* FOOTER GLOBAL */}

          <TableFooter>

            <TableRow className="border-none bg-gradient-to-r from-slate-900 via-violet-800 to-cyan-700 text-white">

              <TableCell
                colSpan={2}
                className="text-right text-xl font-black"
              >
                TOTAL GLOBAL
              </TableCell>

              <TableCell className="text-right font-black">

                {formatCurrency(
                  globalTotals.sales
                )}

              </TableCell>

              <TableCell className="text-right font-black">

                {globalTotals.quantity}

              </TableCell>

              <TableCell className="text-right font-black">

                {formatCurrency(
                  globalTotals.purchase
                )}

              </TableCell>

              <TableCell className="text-right font-black">

                {formatCurrency(
                  globalTotals.delivery
                )}

              </TableCell>

              <TableCell className="text-right font-black text-emerald-300">

                {formatCurrency(
                  globalTotals.profit
                )}

              </TableCell>

            </TableRow>

          </TableFooter>

        </ModernTable>

      </div>

    </div>
  );
};

export default SalesTable;