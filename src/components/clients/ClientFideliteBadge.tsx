// Badge de fidélité client (synchronisé fidelite.json) — extrait pour usage dans ClientsPage
import React, { useEffect, useState } from 'react';
import { Eye, Crown, Sparkles, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import fideliteApiService, { FideliteEntry } from '@/services/api/fideliteApi';
import ClientFideliteModal from './ClientFideliteModal';

const TIER_META: Record<string, { label: string; grad: string; text: string; icon: React.ReactNode; ring: string }> = {
  nouveau: { label: 'Nouveau Client', grad: 'from-slate-500 to-slate-700', text: 'text-white', icon: <Sparkles className="w-3.5 h-3.5" />, ring: 'ring-slate-400/40' },
  standard: { label: 'Client Standard', grad: 'from-sky-500 to-blue-600', text: 'text-white', icon: <ShoppingBag className="w-3.5 h-3.5" />, ring: 'ring-sky-400/40' },
  bon: { label: 'Bon Client', grad: 'from-emerald-500 to-teal-600', text: 'text-white', icon: <TrendingUp className="w-3.5 h-3.5" />, ring: 'ring-emerald-400/40' },
  fidele: { label: 'Client Fidèle', grad: 'from-purple-500 via-fuchsia-500 to-pink-500', text: 'text-white', icon: <Award className="w-3.5 h-3.5" />, ring: 'ring-fuchsia-400/50' },
  vip: { label: 'Client VIP', grad: 'from-yellow-400 via-amber-500 to-orange-500', text: 'text-black', icon: <Crown className="w-3.5 h-3.5" />, ring: 'ring-amber-400/60' },
};

interface Props { clientName: string; className?: string; }

const ClientFideliteBadge: React.FC<Props> = ({ clientName, className = '' }) => {
  const [fid, setFid] = useState<FideliteEntry | null>(null);
  const [showFid, setShowFid] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fideliteApiService.getByName(clientName).then((r) => { if (alive) setFid(r); }).catch(() => {});
    };
    load();
    const onSales = () => load();
    window.addEventListener('sales-updated', onSales);
    return () => { alive = false; window.removeEventListener('sales-updated', onSales); };
  }, [clientName]);

  const tierKey = fid?.tier || 'nouveau';
  const tier = TIER_META[tierKey];

  return (
    <div className={`relative z-10 ${className}`}>
      <div className={`group/fid flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-gradient-to-r ${tier.grad} ${tier.text} shadow-lg ring-2 ${tier.ring} transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shrink-0 group-hover/fid:rotate-12 transition-transform duration-500">
            {tier.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold leading-none">Fidélité</p>
            <p className="text-sm font-black truncate leading-tight">
              {tier.label}
              {fid && fid.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-80 font-semibold">· {fid.count} achat{fid.count > 1 ? 's' : ''}</span>
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