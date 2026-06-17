/**
 * PrixHistoryModal.tsx — Modale ultra moderne d'historique des prix d'achat
 *
 * Affiche pour un produit donné :
 *  - tous les renseignements (nom, fournisseurs, caractéristiques…)
 *  - toutes les dates d'achat avec variation (augmentation / diminution / stable)
 *  - quel mois / jour le prix augmente, diminue, reste constant
 *  - quand acheter pour avoir le prix le plus bas, prix max / min
 *  - graphes par année (sélection d'année)
 *
 * Source : base de données prixproducts.json (route /api/prix-products)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Calendar,
  ArrowUpRight, ArrowDownRight, Equal, Trophy, AlertTriangle, Package
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { prixProductsApiService, PrixProductEntry } from '@/services/api/prixProductsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const fmtEuro = (v: number) => `${(Number(v) || 0).toFixed(2)}€`;

const PrixHistoryModal: React.FC<Props> = ({ isOpen, onClose, product }) => {
  const [entries, setEntries] = useState<PrixProductEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!isOpen || !product) return;
    let cancelled = false;
    setLoading(true);
    prixProductsApiService.getByProduct(product.id)
      .then(list => {
        if (cancelled) return;
        const sorted = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEntries(sorted);
        if (sorted.length) {
          setSelectedYear(new Date(sorted[sorted.length - 1].date).getFullYear());
        }
      })
      .catch(err => console.error('PrixHistory load error', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [isOpen, product]);

  const years = useMemo(() => {
    const set = new Set(entries.map(e => new Date(e.date).getFullYear()));
    if (!set.size) set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [entries]);

  const yearEntries = useMemo(
    () => entries.filter(e => new Date(e.date).getFullYear() === selectedYear),
    [entries, selectedYear]
  );

  const chartData = useMemo(
    () => yearEntries.map(e => ({
      label: format(new Date(e.date), 'dd MMM', { locale: fr }),
      fullDate: format(new Date(e.date), 'dd MMMM yyyy', { locale: fr }),
      prix: Number(e.purchasePrice) || 0,
      variation: Number(e.variationPercent) || 0,
      type: e.variationType
    })),
    [yearEntries]
  );

  const monthAgg = useMemo(() => {
    const arr = MONTH_LABELS.map((m, idx) => ({
      mois: m,
      monthIndex: idx,
      moyenne: 0,
      min: Infinity,
      max: -Infinity,
      count: 0,
      augmentation: 0,
      diminution: 0,
      stable: 0
    }));
    yearEntries.forEach(e => {
      const idx = new Date(e.date).getMonth();
      const cell = arr[idx];
      cell.count += 1;
      cell.moyenne += Number(e.purchasePrice) || 0;
      cell.min = Math.min(cell.min, Number(e.purchasePrice) || 0);
      cell.max = Math.max(cell.max, Number(e.purchasePrice) || 0);
      if (e.variationType === 'augmentation') cell.augmentation += 1;
      else if (e.variationType === 'diminution') cell.diminution += 1;
      else cell.stable += 1;
    });
    return arr.map(c => ({
      ...c,
      moyenne: c.count ? +(c.moyenne / c.count).toFixed(2) : 0,
      min: c.min === Infinity ? 0 : c.min,
      max: c.max === -Infinity ? 0 : c.max
    }));
  }, [yearEntries]);

  const stats = useMemo(() => {
    if (!yearEntries.length) return null;
    const prices = yearEntries.map(e => Number(e.purchasePrice) || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minEntry = yearEntries.find(e => Number(e.purchasePrice) === minPrice)!;
    const maxEntry = yearEntries.find(e => Number(e.purchasePrice) === maxPrice)!;
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const augm = yearEntries.filter(e => e.variationType === 'augmentation').length;
    const dim = yearEntries.filter(e => e.variationType === 'diminution').length;
    const stable = yearEntries.filter(e => e.variationType === 'stable').length;
    // Best month to buy = month with lowest avg (count > 0)
    const monthsWith = monthAgg.filter(m => m.count > 0);
    const bestMonth = monthsWith.length
      ? monthsWith.reduce((a, b) => (a.moyenne < b.moyenne ? a : b))
      : null;
    const worstMonth = monthsWith.length
      ? monthsWith.reduce((a, b) => (a.moyenne > b.moyenne ? a : b))
      : null;
    return { minPrice, maxPrice, minEntry, maxEntry, avg, augm, dim, stable, bestMonth, worstMonth };
  }, [yearEntries, monthAgg]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 border border-white/10 text-white p-0 rounded-3xl">
        <div className="relative">
          {/* Glow background */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          </div>

          <div className="relative p-6 md:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-black flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                    Historique des prix d'achat
                  </div>
                  <div className="text-sm font-medium text-white/60 mt-1">
                    {product?.description || '—'}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Renseignements produit */}
            {product && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Info label="Code" value={product.code || '—'} color="text-cyan-300" />
                <Info label="Prix actuel" value={`${product.purchasePrice}€`} color="text-amber-300" />
                <Info label="Stock" value={String(product.quantity)} color="text-emerald-300" />
                <Info label="Fournisseur" value={product.fournisseur || '—'} color="text-purple-300" />
              </div>
            )}

            {/* Year selector */}
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="h-4 w-4 text-white/60" />
              <span className="text-sm font-semibold text-white/80 mr-2">Année :</span>
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-bold border transition-all',
                    selectedYear === y
                      ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-fuchsia-500/30'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>

            {loading && (
              <div className="py-16 text-center text-white/60">Chargement…</div>
            )}

            {!loading && !yearEntries.length && (
              <div className="py-16 text-center text-white/60 border border-dashed border-white/10 rounded-2xl">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                Aucun historique de prix pour {selectedYear}.
              </div>
            )}

            {!loading && yearEntries.length > 0 && stats && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={<TrendingDown className="h-5 w-5" />}
                    label="Prix le plus bas"
                    value={fmtEuro(stats.minPrice)}
                    sub={format(new Date(stats.minEntry.date), 'dd MMM yyyy', { locale: fr })}
                    gradient="from-emerald-500/20 to-teal-500/10 border-emerald-400/30 text-emerald-300"
                  />
                  <StatCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Prix le plus haut"
                    value={fmtEuro(stats.maxPrice)}
                    sub={format(new Date(stats.maxEntry.date), 'dd MMM yyyy', { locale: fr })}
                    gradient="from-red-500/20 to-rose-500/10 border-red-400/30 text-red-300"
                  />
                  <StatCard
                    icon={<Trophy className="h-5 w-5" />}
                    label="Meilleur mois d'achat"
                    value={stats.bestMonth?.mois || '—'}
                    sub={stats.bestMonth ? `moyenne ${fmtEuro(stats.bestMonth.moyenne)}` : ''}
                    gradient="from-indigo-500/20 to-purple-500/10 border-indigo-400/30 text-indigo-300"
                  />
                  <StatCard
                    icon={<AlertTriangle className="h-5 w-5" />}
                    label="Mois le plus cher"
                    value={stats.worstMonth?.mois || '—'}
                    sub={stats.worstMonth ? `moyenne ${fmtEuro(stats.worstMonth.moyenne)}` : ''}
                    gradient="from-amber-500/20 to-orange-500/10 border-amber-400/30 text-amber-300"
                  />
                </div>

                {/* Variations résumé */}
                <div className="grid grid-cols-3 gap-3">
                  <VariationBadge type="augmentation" count={stats.augm} />
                  <VariationBadge type="diminution" count={stats.dim} />
                  <VariationBadge type="stable" count={stats.stable} />
                </div>

                {/* Line chart */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-300" />
                    <span className="font-bold">Évolution du prix d'achat — {selectedYear}</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => `${v}€`} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                          formatter={(value: number) => [`${value}€`, 'Prix']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                        />
                        <ReferenceLine y={stats.avg} stroke="#a855f7" strokeDasharray="4 4" label={{ value: `Moyenne ${stats.avg.toFixed(2)}€`, fill: '#a855f7', fontSize: 11, position: 'insideTopRight' }} />
                        <Line type="monotone" dataKey="prix" stroke="url(#priceGradient)" strokeWidth={3} dot={{ r: 5, fill: '#a855f7' }} activeDot={{ r: 7 }} />
                        <defs>
                          <linearGradient id="priceGradient" x1="0" x2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly bar chart */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-fuchsia-300" />
                    <span className="font-bold">Variations par mois — {selectedYear}</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthAgg}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                        <XAxis dataKey="mois" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                        <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                        <Bar dataKey="augmentation" stackId="v" fill="#ef4444" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="diminution" stackId="v" fill="#10b981" />
                        <Bar dataKey="stable" stackId="v" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Timeline détaillée */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-300" />
                    <span className="font-bold">Détail des achats — {selectedYear}</span>
                  </div>
                  <div className="space-y-2">
                    {yearEntries.slice().reverse().map(e => (
                      <div key={e.id} className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-sm font-bold text-white/90 min-w-[140px]">
                          {format(new Date(e.date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                        <span className="text-amber-300 font-bold">{fmtEuro(e.purchasePrice)}</span>
                        <VariationPill type={e.variationType} pct={e.variationPercent} prev={e.previousPrice} />
                        <span className="text-xs text-white/60 ml-auto">
                          Qté: <span className="text-white font-semibold">{e.quantity}</span>
                          {e.fournisseur && <> · Fourn.: <span className="text-cyan-300 font-semibold">{e.fournisseur}</span></>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Info: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
    <p className="text-white/50 text-xs font-medium">{label}</p>
    <p className={cn('font-bold text-base truncate', color)}>{value}</p>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; gradient: string }> = ({ icon, label, value, sub, gradient }) => (
  <div className={cn('p-4 rounded-2xl border bg-gradient-to-br', gradient)}>
    <div className="flex items-center gap-2 mb-1 opacity-90">{icon}<span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
    <div className="text-xl font-black">{value}</div>
    {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
  </div>
);

const VariationBadge: React.FC<{ type: 'augmentation' | 'diminution' | 'stable'; count: number }> = ({ type, count }) => {
  const map = {
    augmentation: { icon: <ArrowUpRight className="h-4 w-4" />, label: 'Augmentations', cls: 'from-red-500/20 to-rose-500/10 border-red-400/30 text-red-300' },
    diminution: { icon: <ArrowDownRight className="h-4 w-4" />, label: 'Diminutions', cls: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/30 text-emerald-300' },
    stable: { icon: <Equal className="h-4 w-4" />, label: 'Stables', cls: 'from-blue-500/20 to-indigo-500/10 border-blue-400/30 text-blue-300' }
  } as const;
  const c = map[type];
  return (
    <div className={cn('flex items-center justify-between p-3 rounded-2xl border bg-gradient-to-br', c.cls)}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">{c.icon}{c.label}</div>
      <div className="text-2xl font-black">{count}</div>
    </div>
  );
};

const VariationPill: React.FC<{ type: string; pct: number; prev: number | null }> = ({ type, pct, prev }) => {
  let cls = 'bg-blue-500/15 text-blue-300 border-blue-400/30';
  let Icon: any = Minus;
  let label = `${pct.toFixed(2)}%`;
  if (type === 'augmentation') { cls = 'bg-red-500/15 text-red-300 border-red-400/30'; Icon = TrendingUp; label = `+${pct.toFixed(2)}%`; }
  else if (type === 'diminution') { cls = 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'; Icon = TrendingDown; label = `${pct.toFixed(2)}%`; }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border', cls)}>
      <Icon className="h-3 w-3" />
      {label}
      {prev !== null && <span className="opacity-70">(ancien {fmtEuro(prev)})</span>}
    </span>
  );
};

export default PrixHistoryModal;
