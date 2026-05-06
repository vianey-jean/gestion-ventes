import React, { useEffect, useState, useMemo } from 'react';
import { TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell } from '@/components/dashboard/forms/ModernTable';
import { Sale } from '@/types';
import { TrendingUp, Package, Euro, Calendar, Sparkles, Award, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { realtimeService } from '@/services/realtimeService';
import PremiumLoading from '@/components/ui/premium-loading';
import { Button } from '@/components/ui/button';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

/**
 * Tableau des ventes modernisé avec synchronisation temps réel
 * Affiche uniquement les ventes du mois en cours avec filtrage strict
 */
const SalesTable: React.FC<SalesTableProps> = ({ sales: initialSales, onRowClick }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Par défaut: plus petit vers plus grand

  // Fonction pour filtrer les ventes du mois en cours
  const filterCurrentMonthSales = (salesData: Sale[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
  };

  // Filtrer les ventes initiales pour le mois en cours
  const currentMonthSales = useMemo(() => {
    return filterCurrentMonthSales(initialSales);
  }, [initialSales]);

  // Synchronisation temps réel pour les ventes du mois en cours
  useEffect(() => {
    console.log('🔄 Initialisation SalesTable - Filtrage mois en cours');

    // Initialiser avec les ventes du mois en cours seulement
    setSales(currentMonthSales);

    // Connexion au service temps réel
    realtimeService.connect();

    // Écouter les changements de données
    const unsubscribeData = realtimeService.addDataListener((data) => {
      if (data.sales) {
        // Double filtrage : côté serveur ET côté client pour être sûr
        const filteredSales = filterCurrentMonthSales(data.sales);
        console.log('📊 Ventes mois en cours filtrées:', filteredSales.length, 'sur', data.sales.length);
        setSales(filteredSales);
        setLastUpdate(new Date());
      }
    });

    // Écouter les événements de connexion
    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      if (event.type === 'connected') {
        console.log('✅ Connexion temps réel établie pour SalesTable');
        setIsRealtimeActive(true);
      } else if (event.type === 'data-changed' && event.data?.type === 'sales') {
        console.log('⚡ Changement de ventes détecté - Filtrage mois en cours');
        if (event.data.data) {
          const filteredSales = filterCurrentMonthSales(event.data.data);
          setSales(filteredSales);
        }
        setLastUpdate(new Date());
      }
    });

    // Vérifier le statut de connexion
    setIsRealtimeActive(realtimeService.getConnectionStatus());

    return () => {
      unsubscribeData();
      unsubscribeSync();
    };
  }, [currentMonthSales]);

  // Mettre à jour les ventes quand les props changent
  useEffect(() => {
    const filtered = filterCurrentMonthSales(initialSales);
    setSales(filtered);
  }, [initialSales]);

  // Fonction pour trier les ventes par date
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Trier les ventes par date selon l'ordre
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sales, sortOrder]);

  // Formater une date au format local
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Formater un montant en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Vérifier si le produit est une avance
  const isAdvanceProduct = (description: string) => {
    return description.includes("Avance Perruque ou Tissages");
  };

  const isRefundSale = (sale: Sale) => {
    return (sale as any).isRefund || (sale.totalSellingPrice ?? sale.sellingPrice ?? 0) < 0;
  };

  const normalizeQuantityForDisplay = (quantity: number, sale: Sale) => {
    return isRefundSale(sale) ? -Math.abs(quantity || 0) : (quantity || 0);
  };

  // Calculer les totaux pour le mois en cours uniquement
  const totalSellingPrice = sortedSales.reduce((sum, sale) => {
    return sum + (sale.totalSellingPrice || sale.sellingPrice || 0);
  }, 0);

  // Calculer le nombre total de produits vendus (pas le nombre de ventes)
  const totalProductsSold = sortedSales.reduce((sum, sale) => {
    if (sale.products) {
      // Pour les ventes multi-produits, sommer toutes les quantités
      return sum + sale.products.reduce((productSum, product) => {
        const baseQuantity = isAdvanceProduct(product.description) ? 0 : product.quantitySold;
        return productSum + normalizeQuantityForDisplay(baseQuantity, sale);
      }, 0);
    }

    // Pour les ventes simples
    const baseQuantity = isAdvanceProduct(sale.description || '') ? 0 : (sale.quantitySold || 0);
    return sum + normalizeQuantityForDisplay(baseQuantity, sale);
  }, 0);

  const totalQuantitySold = totalProductsSold; // Alias pour compatibilité

  const totalPurchasePrice = sortedSales.reduce((sum, sale) => {
    return sum + (sale.totalPurchasePrice || sale.purchasePrice || 0);
  }, 0);

  const totalDeliveryFee = sortedSales.reduce((sum, sale) => {
    if (sale.products) {
      return sum + sale.products.reduce((feeSum, product) => {
        return feeSum + (product.deliveryFee || 0);
      }, 0);
    }
    return sum + (sale.deliveryFee || 0);
  }, 0);

  const totalProfit = sortedSales.reduce((sum, sale) => {
    return sum + (sale.totalProfit || sale.profit || 0);
  }, 0);

  const getCurrentMonthName = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PremiumLoading
        text="Chargement des Ventes"
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Header avec gradient luxueux et indicateur temps réel */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Ventes de {getCurrentMonthName()} - Temps Réel</h3>
            <p className="text-white/80 text-sm">Synchronisation instantanée • Filtrage mois en cours</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Indicateur de synchronisation temps réel */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isRealtimeActive
                ? 'bg-green-500/20 text-green-100'
                : 'bg-red-500/20 text-red-100'
              }`}>
              <div className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
              <span className="text-xs font-medium">
                {isRealtimeActive ? 'Temps réel' : 'Hors ligne'}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="ml-2">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>

        {/* Informations de dernière mise à jour */}
        <div className="mt-2 text-xs text-white/60">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')} • {totalProductsSold} produits vendus ce mois
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto">
      <ModernTable>
        <ModernTableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-none">
            <ModernTableHead className="bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-1">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Date</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  aria-label={`Trier par date ${sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="h-3 w-3 text-red-600" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  )}
                </Button>
              </div>
            </ModernTableHead>
            <ModernTableHead className="bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Description</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                  <Euro className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Prix de vente</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <span className='text-red-600 font-bold text-sm'>Quantités</span>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                  <Euro className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Prix d'achat</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-1">
                  <Euro className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Frais livraison</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-1">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Bénéfice</span>
              </div>
            </ModernTableHead>
          </TableRow>
        </ModernTableHeader>
        <TableBody>
          {sortedSales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full p-6">
                    <Package className="h-12 w-12 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucune vente ce mois-ci</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Les ventes apparaîtront ici en temps réel</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            (() => {
              // Grouper les ventes par jour (clé = YYYY-MM-DD)
              const groups: { key: string; date: string; sales: Sale[] }[] = [];
              const map = new Map<string, { date: string; sales: Sale[] }>();
              sortedSales.forEach((s) => {
                const d = new Date(s.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (!map.has(key)) map.set(key, { date: s.date, sales: [] });
                map.get(key)!.sales.push(s);
              });
              map.forEach((v, k) => groups.push({ key: k, ...v }));

              const computeDayTotals = (daySales: Sale[]) => {
                const sell = daySales.reduce((a, s) => a + (s.totalSellingPrice ?? s.sellingPrice ?? 0), 0);
                const purch = daySales.reduce((a, s) => a + (s.totalPurchasePrice ?? s.purchasePrice ?? 0), 0);
                const deliv = daySales.reduce((a, s) => {
                  if (s.products) return a + s.products.reduce((p, pr) => p + (pr.deliveryFee || 0), 0);
                  return a + (s.deliveryFee || 0);
                }, 0);
                const profit = daySales.reduce((a, s) => a + (s.totalProfit ?? s.profit ?? 0), 0);
                const qty = daySales.reduce((a, s) => {
                  if (s.products) {
                    return a + s.products.reduce((p, pr) => p + normalizeQuantityForDisplay(isAdvanceProduct(pr.description) ? 0 : pr.quantitySold, s), 0);
                  }
                  return a + normalizeQuantityForDisplay(isAdvanceProduct(s.description || '') ? 0 : (s.quantitySold || 0), s);
                }, 0);
                return { sell, purch, deliv, profit, qty };
              };

              let globalIndex = 0;
              return groups.map((group) => {
                const totals = computeDayTotals(group.sales);
                return (
                  <React.Fragment key={`group-${group.key}`}>
                    {group.sales.map((sale, idxInGroup) => {
                      const index = globalIndex++;
                      const isRefund = (sale as any).isRefund || (sale.totalSellingPrice ?? sale.sellingPrice ?? 0) < 0;
                      const isFirst = idxInGroup === 0;
                      // Bordure rouge gras encadrant le groupe d'une journée
                      const groupBorderTop = isFirst ? 'border-t-4 border-t-red-600' : '';
                      const sideBorder = 'first:border-l-4 first:border-l-red-600 last:border-r-4 last:border-r-red-600';
                      return (
                        <ModernTableRow
                          key={sale.id}
                          onClick={() => onRowClick(sale)}
                          className={`${isRefund ? 'bg-red-50/80 dark:bg-red-900/20' : ''} ${groupBorderTop} hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg cursor-pointer [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-red-600 [&>td:last-child]:border-r-4 [&>td:last-child]:border-r-red-600`}
                        >
                  <ModernTableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-gray-700 font-bold dark:text-gray-300">{formatDate(sale.date)}</span>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="font-medium">
                    <div className="max-w-xs space-y-1">
                      {isRefund && (
                        <span className="inline-block text-[10px] font-bold text-white bg-red-500 rounded px-1.5 py-0.5 mb-1">
                          REMBOURSEMENT
                        </span>
                      )}
                      {sale.products ? (
                        sale.products.map((product, idx) => (
                          <p key={idx} className={`font-semibold truncate text-xs ${isRefund ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {product.description}
                          </p>
                        ))
                      ) : (
                        <p className={`font-semibold truncate ${isRefund ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {sale.description}
                        </p>
                      )}
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className={`${isRefund ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30'} px-3 py-1 rounded-full inline-block`}>
                      <span className={`font-bold ${isRefund ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {formatCurrency(sale.totalSellingPrice ?? sale.sellingPrice ?? 0)}
                      </span>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className={`${isRefund ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'} px-3 py-1 rounded-full inline-block`}>
                      <span className={`font-semibold ${isRefund ? 'text-red-700 dark:text-red-400' : 'text-purple-700 dark:text-purple-400'}`}>
                        {sale.products ? (
                          <div className="space-y-1">
                            {sale.products.map((product, idx) => (
                              <div key={idx} className="text-xs">
                                {normalizeQuantityForDisplay(isAdvanceProduct(product.description) ? 0 : product.quantitySold, sale)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          normalizeQuantityForDisplay(isAdvanceProduct(sale.description || '') ? 0 : (sale.quantitySold || 0), sale)
                        )}
                      </span>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className={`${isRefund ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30'} px-3 py-1 rounded-full inline-block`}>
                      {sale.products ? (
                        <div className="space-y-1">
                          {sale.products.map((product, idx) => (
                            <div key={idx} className={`text-xs font-bold ${isRefund ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              {formatCurrency(product.purchasePrice)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className={`font-bold ${isRefund ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {formatCurrency(sale.purchasePrice)}
                        </span>
                      )}
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 px-3 py-1 rounded-full inline-block">
                      <span className="font-bold text-blue-700 dark:text-blue-400">
                        {sale.products ? (
                          <div className="space-y-1">
                            {sale.products.map((product, idx) => (
                              <div key={idx} className="text-xs">
                                {formatCurrency(product.deliveryFee || 0)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          formatCurrency(sale.deliveryFee || 0)
                        )}
                      </span>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className={`${isRefund ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'} px-3 py-1 rounded-full inline-block`}>
                      <span className={`font-bold ${isRefund ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                        {sale.products ? (
                          <div className="space-y-1">
                            {sale.products.map((product, idx) => (
                              <div key={idx} className="text-xs">
                                {formatCurrency(product.profit)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          formatCurrency(sale.profit)
                        )}
                      </span>
                    </div>
                  </ModernTableCell>
                </ModernTableRow>
                      );
                    })}
                    {/* Ligne total du jour - bordures rouges gras bas + côtés */}
                    <TableRow className="bg-red-50/60 dark:bg-red-900/10 border-b-4 border-b-red-600 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-red-600 [&>td:last-child]:border-r-4 [&>td:last-child]:border-r-red-600">
                      <TableCell className="font-bold text-red-600 bg-transparent whitespace-nowrap">
                        Total vente: {formatDate(group.date)}
                      </TableCell>
                      <TableCell className="bg-transparent" />
                      <TableCell className="text-right font-bold text-red-600 bg-transparent">
                        Total: {formatCurrency(totals.sell)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 bg-transparent">
                        Total: {totals.qty}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 bg-transparent">
                        Total: {formatCurrency(totals.purch)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 bg-transparent">
                        Total: {formatCurrency(totals.deliv)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 bg-transparent">
                        Total: {formatCurrency(totals.profit)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              });
            })()
          )}
        </TableBody>
        {sortedSales.length > 0 && (
          <TableFooter>
            <TableRow className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white border-none hover:bg-indigo-900 hover:bg-none">

              <TableCell colSpan={2} className="text-right text-lg font-bold bg-transparent">
                <div className="flex items-center justify-end space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Totaux du mois:</span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-emerald-200">
                    {formatCurrency(totalSellingPrice)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-purple-200">
                    {totalQuantitySold}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <span className="text-lg font-bold text-gray-200">
                  {formatCurrency(totalPurchasePrice)}
                </span>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-blue-200">
                    {formatCurrency(totalDeliveryFee)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-yellow-200">
                    {formatCurrency(totalProfit)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </ModernTable>
      </div>
    </div>
  );
};

export default SalesTable;
