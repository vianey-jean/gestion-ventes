/**
 * ClientFideliteModal — Modale ultra-moderne affichant l'historique complet
 * des ventes d'un client (basée sur fidelite.json) : tier, nombre d'achats,
 * total dépensé, et détail par vente (date, produits, montants).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, Sparkles, TrendingUp, ShoppingBag, Calendar, Package, Receipt, Award, ExternalLink } from 'lucide-react';
import fideliteApiService, { FideliteEntry } from '@/services/api/fideliteApi';
import listesFideliteApi, { FideliteTierConfig, tierForCount } from '@/services/api/listesFideliteApi';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientName: string;
}

const ICONS = [
  <Sparkles className="w-4 h-4" />,
  <ShoppingBag className="w-4 h-4" />,
  <TrendingUp className="w-4 h-4" />,
  <Award className="w-4 h-4" />,
  <Crown className="w-4 h-4" />,
];

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return d; }
};

const ClientFideliteModal: React.FC<Props> = ({ open, onOpenChange, clientName }) => {
  const [data, setData] = useState<FideliteEntry | null>(null);
  const [tiers, setTiers] = useState<FideliteTierConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !clientName) return;
    let alive = true;
    setLoading(true);
    Promise.all([
      fideliteApiService.getByName(clientName),
      listesFideliteApi.getAll(),
    ])
      .then(([res, t]) => { if (alive) { setData(res); setTiers(t); } })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [open, clientName]);

  const count = data?.count ?? 0;
  const tierCfg = tiers.length > 0 ? tierForCount(count, tiers) : null;
  const grad = tierCfg?.grad || 'from-slate-500 to-slate-700';
  const label = tierCfg?.label || data?.tierLabel || 'Nouveau Client';
  const textCls = /yellow|amber|orange/.test(grad) ? 'text-black' : 'text-white';
  const ringCls = 'ring-white/30';
  const icon = ICONS[Math.min(tierCfg?.order ?? 0, ICONS.length - 1)];
  const tier = { grad, text: textCls, ring: ringCls, icon, label };


  const byMonth = useMemo(() => {
    const map = new Map<string, { label: string; total: number; count: number }>();
    (data?.sales || []).forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const cur = map.get(key) || { label, total: 0, count: 0 };
      cur.total += s.amount;
      cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0])).map(([, v]) => v);
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    p-0
    gap-0
    w-[calc(100vw-1rem)]
    sm:w-[min(96vw,760px)]
    max-w-[760px]
    h-[92vh]
    max-h-[92vh]
    rounded-3xl
    border-0
    shadow-2xl
    overflow-hidden
    bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60
  "
      >
        <DialogHeader className="px-5 sm:px-8 pt-6 pb-5 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-pink-600/20 border-b border-white/10">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tier.grad} ${tier.text} flex items-center justify-center shadow-lg ring-2 ${tier.ring}`}>
                {tier.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Fiche fidélité</p>
                <p className="text-lg sm:text-xl font-black truncate">{clientName}</p>
              </div>
            </div>
            <Badge className={`ml-auto bg-gradient-to-r ${tier.grad} ${tier.text} border-0 font-black text-xs px-3 py-1.5 rounded-full shadow-lg`}>
              {tier.icon}<span className="ml-1">{tier.label}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea
          className="
    h-[calc(92vh-100px)]
    sm:h-[calc(92vh-110px)]
    overflow-y-auto
    overscroll-contain
  "
        >
          <div
            className="
      p-5
      sm:p-8
      pb-32
      sm:pb-16
      space-y-6
    "
          >
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/20 backdrop-blur">
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" /> Achats
                </div>
                <p className="mt-2 text-3xl font-black text-white">{data?.count ?? 0}</p>
              </div>
              <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/20 backdrop-blur">
                <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                  <Receipt className="w-3.5 h-3.5" /> Total dépensé
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-200/80">{fmt(data?.totalAmount ?? 0)} <span className="mt-2 text-2xl sm:text-3xl  text-emerald-200/80">€</span></p>
              </div>
              <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-400/20 backdrop-blur col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> Panier moyen
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-200/80">
                  {fmt((data?.count || 0) > 0 ? (data!.totalAmount / data!.count) : 0)} <span className="mt-2 text-2xl sm:text-3xl text-amber-200/80">€</span>
                </p>
              </div>
            </div>

            {/* Répartition par mois */}
            {byMonth.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-white/60 font-bold mb-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Répartition mensuelle
                </h4>
                <div className="flex flex-wrap gap-2">
                  {byMonth.map((m, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-semibold backdrop-blur">
                      <span className="capitalize">{m.label}</span>
                      <span className="ml-2 text-emerald-300">{fmt(m.total)} €</span>
                      <span className="ml-1.5 text-white/50">· {m.count} achat{m.count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des ventes */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/60 font-bold mb-3 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Historique des ventes ({data?.sales.length ?? 0})
              </h4>

              {loading && <p className="text-white/50 text-sm">Chargement…</p>}

              {!loading && (!data || data.sales.length === 0) && (
                <div className="rounded-2xl p-6 border border-dashed border-white/15 text-center text-white/60 text-sm">
                  Aucun achat enregistré pour ce client.
                </div>
              )}

              <div className="space-y-3">
                {(data?.sales || []).map((s) => {
                  const dt = new Date(s.date);
                  const targetMonth = dt.getMonth() + 1;
                  const targetYear = dt.getFullYear();
                  const handleNavigate = () => {
                    try {
                      const payload = {
                        saleId: s.id,
                        month: targetMonth,
                        year: targetYear,
                        clientName,
                        ts: Date.now(),
                      };
                      sessionStorage.setItem('fideliteSaleNav', JSON.stringify(payload));
                      window.dispatchEvent(new CustomEvent('fidelite-sale-nav', { detail: payload }));
                    } catch {}
                    onOpenChange(false);
                  };
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={handleNavigate}
                      title="Voir cette vente dans la page Ventes"
                      className={`w-full text-left rounded-2xl p-4 border ${s.isRefund ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'} backdrop-blur hover:bg-emerald-500/10 hover:border-emerald-400/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-[1.01] transition-all duration-300 group cursor-pointer`}
                    >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {fmtDate(s.date)}
                          {s.isRefund && <Badge className="bg-red-500/80 text-white border-0 text-[10px]">Remboursement</Badge>}
                          <ExternalLink className="w-3 h-3 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {s.clientVille && <p className="text-[11px] text-white/50 mt-0.5">📍 {s.clientVille}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-300">{fmt(s.amount)} €</p>
                        {typeof s.profit === 'number' && s.profit !== 0 && (
                          <p className="text-[11px] text-white/50">Bénéfice: {fmt(s.profit)} €</p>
                        )}
                      </div>
                    </div>

                    {Array.isArray(s.products) && s.products.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {s.products.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-2 text-xs bg-black/20 rounded-lg px-3 py-2 border border-white/5">
                            <span className="text-white/90 truncate">
                              <span className="text-purple-300 font-bold">{p.quantitySold ?? p.quantity ?? 1}×</span>{' '}
                              {p.description || p.name || 'Produit'}
                            </span>
                            <span className="text-white/70 font-semibold whitespace-nowrap">
                              {fmt((Number(p.sellingPrice) || 0) * (Number(p.quantity ?? 1) || 1))} €
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-[10px] text-emerald-300/70 opacity-0 group-hover:opacity-100 transition-opacity font-semibold uppercase tracking-wider">
                      → Cliquer pour voir dans la page Ventes
                    </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFideliteModal;
