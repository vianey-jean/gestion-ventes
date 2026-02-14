
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sale } from '@/types/sale';
import { saleApiService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Crown, TrendingUp, ChevronDown, Sparkles, Search } from 'lucide-react';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface VentesParClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClientSalesGroup {
  clientName: string;
  sales: {
    date: string;
    description: string;
    sellingPrice: number;
    quantitySold: number;
    purchasePrice: number;
    deliveryFee: number;
    profit: number;
  }[];
  totalSellingPrice: number;
  totalProfit: number;
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const VentesParClientsModal: React.FC<VentesParClientsModalProps> = ({ isOpen, onClose }) => {
  const { formatCurrency } = useCurrencyFormatter();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const handleValidate = async () => {
    setIsLoading(true);
    try {
      const data = await saleApiService.getByMonth(selectedMonth, selectedYear);
      setSales(data);
      setShowDatePicker(false);
    } catch (error) {
      console.error('Erreur chargement ventes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clientGroups = useMemo(() => {
    const groups: Record<string, ClientSalesGroup> = {};

    sales.forEach(sale => {
      const clientName = sale.clientName || 'Client inconnu';

      if (!groups[clientName]) {
        groups[clientName] = {
          clientName,
          sales: [],
          totalSellingPrice: 0,
          totalProfit: 0,
        };
      }

      // Multi-product sales
      if (sale.products && sale.products.length > 0) {
        sale.products.forEach(p => {
          groups[clientName].sales.push({
            date: sale.date,
            description: p.description || '',
            sellingPrice: p.sellingPrice || 0,
            quantitySold: p.quantitySold || 0,
            purchasePrice: p.purchasePrice || 0,
            deliveryFee: p.deliveryFee || 0,
            profit: p.profit || 0,
          });
          groups[clientName].totalSellingPrice += p.sellingPrice || 0;
          groups[clientName].totalProfit += p.profit || 0;
        });
      } else {
        groups[clientName].sales.push({
          date: sale.date,
          description: sale.description || '',
          sellingPrice: sale.sellingPrice || 0,
          quantitySold: sale.quantitySold || 0,
          purchasePrice: sale.purchasePrice || 0,
          deliveryFee: sale.deliveryFee || 0,
          profit: sale.profit || 0,
        });
        groups[clientName].totalSellingPrice += sale.sellingPrice || 0;
        groups[clientName].totalProfit += sale.profit || 0;
      }
    });

    return Object.values(groups)
      .filter(g => g.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.totalSellingPrice - a.totalSellingPrice);
  }, [sales, searchQuery]);

  const handleClose = () => {
    setShowDatePicker(true);
    setSales([]);
    setExpandedClient(null);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 border-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold">Ventes par Clients</span>
              {!showDatePicker && (
                <p className="text-xs text-purple-300 font-normal mt-0.5">
                  {monthNames[selectedMonth - 1]} {selectedYear} • {clientGroups.length} client{clientGroups.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Crown className="h-4 w-4 text-amber-400 ml-auto" />
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] p-5 pt-3">
          <AnimatePresence mode="wait">
            {showDatePicker ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Month/Year Picker */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Sélectionnez la période</h3>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-2 block">Année</label>
                    <div className="grid grid-cols-5 gap-2">
                      {years.map(y => (
                        <button
                          key={y}
                          onClick={() => setSelectedYear(y)}
                          className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            selectedYear === y
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-2 block">Mois</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {monthNames.map((m, i) => (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(i + 1)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            selectedMonth === i + 1
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Validate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleValidate}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-bold text-sm shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Afficher les ventes
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Search + Back */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDatePicker(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Changer
                  </motion.button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-3">
                    <p className="text-[10px] text-purple-300 uppercase tracking-wider">Total Ventes</p>
                    <p className="text-base font-bold text-amber-400 mt-0.5">
                      {formatCurrency(clientGroups.reduce((s, g) => s + g.totalSellingPrice, 0))}
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-3">
                    <p className="text-[10px] text-purple-300 uppercase tracking-wider">Total Bénéfices</p>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(clientGroups.reduce((s, g) => s + g.totalProfit, 0))}
                    </p>
                  </div>
                </div>

                {/* Client Groups */}
                {clientGroups.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aucune vente trouvée pour cette période</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientGroups.map((group, idx) => (
                      <motion.div
                        key={group.clientName}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white/5 backdrop-blur rounded-xl border border-white/10 overflow-hidden"
                      >
                        {/* Client Header */}
                        <button
                          onClick={() => setExpandedClient(expandedClient === group.clientName ? null : group.clientName)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-all text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                              idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20' :
                              idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                              idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                              'bg-gradient-to-br from-purple-500 to-indigo-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{group.clientName}</p>
                              <p className="text-[10px] text-white/40">{group.sales.length} vente{group.sales.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-amber-400 font-bold text-sm">{formatCurrency(group.totalSellingPrice)}</p>
                              <p className="text-[10px] text-emerald-400">+{formatCurrency(group.totalProfit)}</p>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${expandedClient === group.clientName ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {/* Expanded Sales Table */}
                        <AnimatePresence>
                          {expandedClient === group.clientName && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-white/5 overflow-x-auto">
                                <table className="w-full min-w-[600px] text-xs">
                                  <thead>
                                    <tr className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
                                      <th className="text-left p-2.5 text-purple-300 font-semibold">Date</th>
                                      <th className="text-left p-2.5 text-purple-300 font-semibold">Produit</th>
                                      <th className="text-right p-2.5 text-purple-300 font-semibold">Qté</th>
                                      <th className="text-right p-2.5 text-purple-300 font-semibold">P.Achat</th>
                                      <th className="text-right p-2.5 text-purple-300 font-semibold">P.Vente</th>
                                      <th className="text-right p-2.5 text-purple-300 font-semibold">Livraison</th>
                                      <th className="text-right p-2.5 text-purple-300 font-semibold">Bénéfice</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.sales.map((s, si) => (
                                      <tr key={si} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-2.5 text-white/70 whitespace-nowrap">{s.date}</td>
                                        <td className="p-2.5 text-white font-medium truncate max-w-[150px]">{s.description || '-'}</td>
                                        <td className="p-2.5 text-right text-white/70">{s.quantitySold}</td>
                                        <td className="p-2.5 text-right text-white/70">{formatCurrency(s.purchasePrice)}</td>
                                        <td className="p-2.5 text-right text-amber-400 font-semibold">{formatCurrency(s.sellingPrice)}</td>
                                        <td className="p-2.5 text-right text-white/50">{formatCurrency(s.deliveryFee)}</td>
                                        <td className="p-2.5 text-right text-emerald-400 font-semibold">{formatCurrency(s.profit)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-t border-amber-500/20">
                                      <td colSpan={4} className="p-2.5 text-amber-400 font-bold">
                                        <div className="flex items-center gap-1.5">
                                          <TrendingUp className="h-3.5 w-3.5" />
                                          Total {group.clientName}
                                        </div>
                                      </td>
                                      <td className="p-2.5 text-right text-amber-400 font-bold">{formatCurrency(group.totalSellingPrice)}</td>
                                      <td className="p-2.5 text-right text-white/50">
                                        {formatCurrency(group.sales.reduce((s, v) => s + v.deliveryFee, 0))}
                                      </td>
                                      <td className="p-2.5 text-right text-emerald-400 font-bold">{formatCurrency(group.totalProfit)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VentesParClientsModal;
