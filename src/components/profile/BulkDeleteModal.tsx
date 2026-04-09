/**
 * BulkDeleteModal — Modale de suppression sélective (ventes, produits, clients)
 * Style ultra luxe, multi-étapes avec recherche et sélection
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ShoppingCart, Package, Users, Search, CheckSquare, Square,
  ChevronLeft, AlertTriangle, Calendar, X, Loader2, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

type DeleteType = 'sales' | 'products' | 'clients';
type Step = 'choose-type' | 'choose-filter' | 'select-items' | 'confirm';

interface BulkItem {
  id: string;
  description?: string;
  nom?: string;
  phone?: string;
  adresse?: string;
  date?: string;
  totalSellingPrice?: number;
  sellingPrice?: number;
  clientName?: string;
  purchasePrice?: number;
  quantity?: number;
}

interface BulkDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('choose-type');
  const [type, setType] = useState<DeleteType | null>(null);
  const [items, setItems] = useState<BulkItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'year' | 'month' | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep('choose-type');
      setType(null);
      setItems([]);
      setSelectedIds(new Set());
      setSearchTerm('');
      setSelectedYear(null);
      setSelectedMonth(null);
      setFilterMode(null);
      setYears([]);
    }
  }, [open]);

  const fetchData = useCallback(async (t: DeleteType, month?: number, year?: number) => {
    setLoading(true);
    try {
      const params: any = { type: t };
      if (month !== undefined) params.month = month;
      if (year !== undefined) params.year = year;
      const res = await api.get('/api/settings/bulk-data', { params });
      setItems(res.data.data || []);
      if (res.data.years) setYears(res.data.years);
    } catch (e) {
      console.error('Error fetching bulk data:', e);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleTypeSelect = (t: DeleteType) => {
    setType(t);
    setSelectedIds(new Set());
    setSearchTerm('');
    if (t === 'sales') {
      // For sales, show filter step first
      fetchData(t);
      setStep('choose-filter');
    } else {
      // For products/clients, go directly to items
      fetchData(t);
      setStep('select-items');
    }
  };

  const handleFilterSelect = (mode: 'all' | 'year' | 'month') => {
    setFilterMode(mode);
    if (mode === 'all') {
      fetchData('sales');
      setStep('select-items');
    }
    // For year/month, UI will show selectors
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    if (filterMode === 'year') {
      fetchData('sales', undefined, year);
      setStep('select-items');
    }
    // If month mode, wait for month selection
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    if (selectedYear) {
      fetchData('sales', month, selectedYear);
      setStep('select-items');
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const desc = (item.description || item.nom || '').toLowerCase();
      const client = (item.clientName || item.phone || item.adresse || '').toLowerCase();
      const date = (item.date || '').toLowerCase();
      return desc.includes(term) || client.includes(term) || date.includes(term);
    });
  }, [items, searchTerm]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleDelete = async () => {
    if (!type) return;
    setDeleting(true);
    try {
      const body: any = { type };
      if (selectedIds.size === items.length && items.length > 0) {
        body.deleteAll = true;
        if (type === 'sales' && selectedYear) body.year = selectedYear;
        if (type === 'sales' && selectedMonth) body.month = selectedMonth;
      } else {
        body.ids = Array.from(selectedIds);
      }

      const res = await api.post('/api/settings/bulk-delete', body);
      toast({
        title: '✅ Suppression réussie',
        description: res.data.message,
        className: 'bg-green-600 text-white border-green-600'
      });
      onOpenChange(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erreur lors de la suppression';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const typeLabel = type === 'sales' ? 'vente(s)' : type === 'products' ? 'produit(s)' : 'client(s)';

  const renderItemLabel = (item: BulkItem) => {
    if (type === 'sales') {
      const date = item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '';
      const price = item.totalSellingPrice || item.sellingPrice || 0;
      return (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.description || 'Vente sans description'}</p>
          <p className="text-xs text-muted-foreground">{date} • {price.toLocaleString()} Ar{item.clientName ? ` • ${item.clientName}` : ''}</p>
        </div>
      );
    } else if (type === 'products') {
      return (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.description}</p>
          <p className="text-xs text-muted-foreground">Stock: {item.quantity} • Achat: {item.purchasePrice?.toLocaleString()} Ar</p>
        </div>
      );
    } else {
      return (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.nom}</p>
          <p className="text-xs text-muted-foreground">{item.phone}{item.adresse ? ` • ${item.adresse}` : ''}</p>
        </div>
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-lg max-h-[85vh] flex flex-col">
        <AlertDialogHeader className="flex-shrink-0">
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent font-black">
              Suppression sélective
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {step === 'choose-type' && 'Choisissez le type de données à supprimer'}
            {step === 'choose-filter' && 'Filtrer les ventes par période'}
            {step === 'select-items' && `Sélectionnez les ${typeLabel} à supprimer`}
            {step === 'confirm' && 'Confirmez la suppression'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 py-2">
          <AnimatePresence mode="wait">
            {/* STEP 1: Choose type */}
            {step === 'choose-type' && (
              <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                {([
                  { key: 'sales' as DeleteType, icon: ShoppingCart, label: 'Ventes', desc: 'Supprimer des ventes par période ou individuellement', gradient: 'from-orange-500 to-amber-500' },
                  { key: 'products' as DeleteType, icon: Package, label: 'Produits', desc: 'Supprimer des produits sélectionnés ou tous', gradient: 'from-blue-500 to-indigo-500' },
                  { key: 'clients' as DeleteType, icon: Users, label: 'Clients', desc: 'Supprimer des clients sélectionnés ou tous', gradient: 'from-emerald-500 to-teal-500' },
                ]).map(({ key, icon: Icon, label, desc, gradient }) => (
                  <button
                    key={key}
                    onClick={() => handleTypeSelect(key)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/30 bg-white/50 dark:bg-white/5 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 2: Filter (sales only) */}
            {step === 'choose-filter' && (
              <motion.div key="filter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <button onClick={() => { setStep('choose-type'); setType(null); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
                  <ChevronLeft className="w-3 h-3" /> Retour
                </button>

                {!filterMode && (
                  <div className="space-y-3">
                    <button onClick={() => handleFilterSelect('month')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-white/50 dark:bg-white/5 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all hover:scale-[1.01]">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Par mois et année</span>
                    </button>
                    <button onClick={() => handleFilterSelect('all')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200/30 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-[1.01]">
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Toutes les ventes</span>
                    </button>
                  </div>
                )}

                {filterMode === 'month' && !selectedYear && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choisir l'année</p>
                    <div className="grid grid-cols-3 gap-2">
                      {years.map(y => (
                        <button key={y} onClick={() => handleYearSelect(y)}
                          className="p-2 rounded-xl border border-border/30 bg-white/50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all text-sm font-medium hover:scale-105">
                          {y}
                        </button>
                      ))}
                    </div>
                    {years.length === 0 && !loading && <p className="text-xs text-muted-foreground text-center py-4">Aucune vente trouvée</p>}
                  </div>
                )}

                {filterMode === 'month' && selectedYear && !selectedMonth && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Année {selectedYear} — Choisir le mois</p>
                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS.map((m, i) => (
                        <button key={i} onClick={() => handleMonthSelect(i + 1)}
                          className="p-2 rounded-xl border border-border/30 bg-white/50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all text-xs font-medium hover:scale-105">
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Select items */}
            {step === 'select-items' && (
              <motion.div key="items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col min-h-0 flex-1">
                <button onClick={() => {
                  if (type === 'sales') { setStep('choose-filter'); setFilterMode(null); setSelectedYear(null); setSelectedMonth(null); }
                  else { setStep('choose-type'); setType(null); }
                  setSelectedIds(new Set());
                  setSearchTerm('');
                }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
                  <ChevronLeft className="w-3 h-3" /> Retour
                </button>

                {/* Search bar */}
                <div className="relative mb-3 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Rechercher ${typeLabel}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-xl border-border/30 bg-white/50 dark:bg-white/5 text-sm"
                  />
                </div>

                {/* Select all toggle */}
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-medium hover:text-foreground transition-colors text-muted-foreground">
                    {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-red-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Tout sélectionner ({filteredItems.length})
                  </button>
                  {selectedIds.size > 0 && (
                    <span className="text-xs font-bold text-red-500 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20">
                      {selectedIds.size} sélectionné(s)
                    </span>
                  )}
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[300px] pr-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun résultat trouvé
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150 hover:scale-[1.01] ${
                          selectedIds.has(item.id)
                            ? 'border-red-300/50 bg-red-50/50 dark:bg-red-900/15 shadow-sm'
                            : 'border-border/20 bg-white/30 dark:bg-white/3 hover:bg-white/60 dark:hover:bg-white/8'
                        }`}
                      >
                        {selectedIds.has(item.id) ? (
                          <CheckSquare className="w-4 h-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        {renderItemLabel(item)}
                      </button>
                    ))
                  )}
                </div>

                {/* Delete button */}
                {selectedIds.size > 0 && (
                  <div className="pt-3 flex-shrink-0">
                    <Button
                      onClick={() => setStep('confirm')}
                      className="w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer {selectedIds.size} {typeLabel}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Confirm */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-black text-lg text-red-600">Confirmer la suppression</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vous êtes sur le point de supprimer <span className="font-bold text-red-500">{selectedIds.size} {typeLabel}</span>.
                    Cette action est irréversible.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setStep('select-items')} variant="outline" className="flex-1 rounded-xl">
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    {deleting ? 'Suppression...' : 'Confirmer'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AlertDialogFooter className="flex-shrink-0 pt-0">
          {step !== 'confirm' && (
            <AlertDialogCancel className="rounded-xl">Fermer</AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkDeleteModal;
