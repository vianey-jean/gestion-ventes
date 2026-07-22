// Badge de fidélité client (synchronisé fidelite.json + listes-fidelite.json)
// Les libellés/gradients viennent de listes-fidelite.json (dynamique).
// Les icônes restent basées sur des heuristiques par ordre du palier.
import React, { useEffect, useState } from 'react';
import { Eye, Crown, Sparkles, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import fideliteApiService, { FideliteEntry } from '@/services/api/fideliteApi';
import listesFideliteApi, { FideliteTierConfig, tierForCount } from '@/services/api/listesFideliteApi';
import ClientFideliteModal from './ClientFideliteModal';

const ICONS = [
  <Sparkles className="w-3.5 h-3.5" />,
  <ShoppingBag className="w-3.5 h-3.5" />,
  <TrendingUp className="w-3.5 h-3.5" />,
  <Award className="w-3.5 h-3.5" />,
  <Crown className="w-3.5 h-3.5" />,
];

interface Props { clientName: string; className?: string; }

const ClientFideliteBadge: React.FC<Props> = ({ clientName, className = '' }) => {
  const [fid, setFid] = useState<FideliteEntry | null>(null);
  const [tiers, setTiers] = useState<FideliteTierConfig[]>([]);
  const [showFid, setShowFid] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fideliteApiService.getByName(clientName).then((r) => { if (alive) setFid(r); }).catch(() => {});
    };
    const loadTiers = () => {
      listesFideliteApi.getAll().then((r) => { if (alive) setTiers(r); }).catch(() => {});
    };
    load(); loadTiers();
    const onSales = () => { load(); loadTiers(); };
    window.addEventListener('sales-updated', onSales);
    window.addEventListener('listes-fidelite-updated', onSales);
    return () => {
      alive = false;
      window.removeEventListener('sales-updated', onSales);
      window.removeEventListener('listes-fidelite-updated', onSales);
    };
  }, [clientName]);

  const count = fid?.count ?? 0;
  const tier = tiers.length > 0 ? tierForCount(count, tiers) : null;
  // Aucun palier configuré ou aucun ne correspond → pas de badge de fidélité.
  if (!tier) return null;
  const grad = tier.grad || 'from-slate-500 to-slate-700';
  const label = tier.label;
  const textCls = /yellow|amber|orange/.test(grad) ? 'text-black' : 'text-white';
  const ringCls = 'ring-white/30';
  const icon = ICONS[Math.min(tier.order ?? 0, ICONS.length - 1)];

  return (
    <div className={`relative z-10 ${className}`}>
      <div className={`group/fid flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-gradient-to-r ${grad} ${textCls} shadow-lg ring-2 ${ringCls} transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shrink-0 group-hover/fid:rotate-12 transition-transform duration-500">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold leading-none">Fidélité</p>
            <p className="text-sm font-black truncate leading-tight">
              {label}
              {count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-80 font-semibold">· {count} achat{count > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowFid(true); }}
          className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur flex items-center justify-center transition-all hover:scale-110 shrink-0"
          title="Voir le détail des achats"
          aria-label="Voir le détail des achats"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      <ClientFideliteModal open={showFid} onOpenChange={setShowFid} clientName={clientName} />
    </div>
  );
};

export default ClientFideliteBadge;
