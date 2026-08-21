/**
 * ShieldStatsCard — Supervision temps réel du bouclier anti-piratage
 *
 * Consomme GET /api/security/shield-stats (authentifié) :
 *  - profiles         : empreintes surveillées en mémoire
 *  - bans             : empreintes bannies + expiration
 *  - recentIncidents  : 50 derniers incidents détectés
 *
 * Lecture seule : aucune action destructive n'est exposée côté client.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Ban, Activity, RefreshCw, Fingerprint, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumLoading from '@/components/ui/premium-loading';
import api from '@/service/api';

interface ShieldBan { fingerprint: string; until: string }
interface ShieldIncident {
  at?: string;
  ts?: number;
  type?: string;
  reason?: string;
  path?: string;
  fingerprint?: string;
  score?: number;
}
interface ShieldStats {
  profiles: number;
  bans: ShieldBan[];
  recentIncidents: ShieldIncident[];
}

const fmt = (value?: string | number) => {
  if (!value) return '—';
  const d = new Date(typeof value === 'number' ? value : value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR');
};

const ShieldStatsCard: React.FC = () => {
  const [stats, setStats] = useState<ShieldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/api/security/shield-stats');
      setStats({
        profiles: data?.profiles ?? 0,
        bans: Array.isArray(data?.bans) ? data.bans : [],
        recentIncidents: Array.isArray(data?.recentIncidents) ? data.recentIncidents : [],
      });
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Statistiques indisponibles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(true), 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const metrics = [
    { label: 'Empreintes suivies', value: stats?.profiles ?? 0, icon: Fingerprint, tone: 'from-indigo-500 to-violet-500' },
    { label: 'Bannissements actifs', value: stats?.bans.length ?? 0, icon: Ban, tone: 'from-rose-500 to-red-500' },
    { label: 'Incidents récents', value: stats?.recentIncidents.length ?? 0, icon: Activity, tone: 'from-amber-500 to-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold">Bouclier anti-intrusion</h3>
            <p className="text-xs text-muted-foreground">Supervision en direct · rafraîchi toutes les 30 s</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && !stats ? (
        <PremiumLoading text="Analyse du bouclier" size="sm" />
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${m.tone}`}>
                  <m.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xl font-black leading-none">{m.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {stats!.bans.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Empreintes bannies</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stats!.bans.map((b) => (
                  <div key={b.fingerprint} className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                    <code className="text-xs font-mono truncate">{b.fingerprint}</code>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">jusqu'au {fmt(b.until)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Derniers incidents</p>
            {stats!.recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tentative d'intrusion détectée.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {[...stats!.recentIncidents].reverse().map((inc, i) => (
                  <div key={i} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{inc.type || inc.reason || 'incident'}</span>
                      <span className="text-[11px] text-muted-foreground">{fmt(inc.at ?? inc.ts)}</span>
                    </div>
                    {(inc.path || inc.fingerprint) && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {inc.path || ''} {inc.fingerprint ? `· ${inc.fingerprint}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShieldStatsCard;
