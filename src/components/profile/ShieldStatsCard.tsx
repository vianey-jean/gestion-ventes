/**
 * ShieldStatsCard — Supervision temps réel du bouclier anti-piratage
 *
 * Sources de données (toutes déjà exposées par l'API, authentifiées) :
 *  - GET    /api/security/shield-stats  → profils suivis, bannissements,
 *                                         incidents récents, `intrusionStats`
 *                                         (agrégats) et `intrusions` (extrait).
 *  - GET    /api/security/intrusions    → journal détaillé filtrable
 *                                         (severity, mode, ip, limit).
 *  - DELETE /api/security/intrusions    → purge du journal
 *                                         (administrateur principale seulement).
 *
 * La carte affiche :
 *  1. des cartes de statistiques (total, 24 h, bloquées, bannissements…),
 *  2. la répartition par sévérité et les modes d'attaque les plus fréquents,
 *  3. un tableau détaillé des intrusions avec filtres sévérité / mode / IP,
 *  4. un bouton de purge réservé à l'administrateur principale.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Ban, Activity, RefreshCw, Fingerprint, AlertTriangle,
  Trash2, Filter, Globe, Search, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PremiumLoading from '@/components/ui/premium-loading';
import { toast } from 'sonner';
import api from '@/service/api';
import { useAuth } from '@/contexts/AuthContext';

/** Bannissement actif renvoyé par l'API */
interface ShieldBan { fingerprint: string; until: string }

/** Incident brut du journal rotatif (threat-log.json) */
interface ShieldIncident {
  at?: string;
  ts?: number;
  type?: string;
  reason?: string;
  path?: string;
  fingerprint?: string;
  score?: number;
}

/** Entrée détaillée du journal d'intrusions (server/db/intrusions.json) */
interface Intrusion {
  id?: string;
  at?: string;
  ts?: number;
  ip?: string;
  fingerprint?: string;
  method?: string;
  path?: string;
  url?: string;
  browser?: string;
  os?: string;
  device?: string;
  tags?: string[];
  modes?: string;
  severity?: 'critique' | 'eleve' | 'moyen' | 'faible' | string;
  action?: string;
  reason?: string;
  score?: number;
  banUntil?: string | null;
}

/** Agrégats calculés côté serveur */
interface IntrusionStats {
  total: number;
  last24h: number;
  blocked: number;
  bySeverity: Record<string, number>;
  topModes: { key: string; count: number }[];
  topIps: { key: string; count: number }[];
  topPaths: { key: string; count: number }[];
  topBrowsers: { key: string; count: number }[];
  firstAt?: string | null;
  lastAt?: string | null;
}

interface ShieldStats {
  profiles: number;
  bans: ShieldBan[];
  recentIncidents: ShieldIncident[];
  intrusionStats?: IntrusionStats | null;
}

/** Formate une date ISO ou un timestamp en date française lisible */
const fmt = (value?: string | number | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR');
};

/** Styles de badge par sévérité */
const severityStyles: Record<string, string> = {
  critique: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  eleve: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  moyen: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  faible: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

/** Styles de badge par action appliquée par le bouclier */
const actionStyles: Record<string, string> = {
  ban: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  reject: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  tarpit: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  observe: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  log: 'bg-muted text-muted-foreground',
};

const ShieldStatsCard: React.FC = () => {
  const { user } = useAuth();
  const isAdminPrincipal = (user as any)?.role === 'administrateur principale';

  const [stats, setStats] = useState<ShieldStats | null>(null);
  const [intrusions, setIntrusions] = useState<Intrusion[]>([]);
  const [intrusionsTotal, setIntrusionsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  // Filtres du tableau détaillé
  const [severity, setSeverity] = useState<string>('all');
  const [mode, setMode] = useState<string>('all');
  const [ipQuery, setIpQuery] = useState('');

  /** Charge les agrégats du bouclier */
  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/api/security/shield-stats');
      setStats({
        profiles: data?.profiles ?? 0,
        bans: Array.isArray(data?.bans) ? data.bans : [],
        recentIncidents: Array.isArray(data?.recentIncidents) ? data.recentIncidents : [],
        intrusionStats: data?.intrusionStats ?? null,
      });
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Statistiques indisponibles');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Charge le journal détaillé selon les filtres actifs */
  const loadIntrusions = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { limit: 200 };
      if (severity !== 'all') params.severity = severity;
      if (mode !== 'all') params.mode = mode;
      if (ipQuery.trim()) params.ip = ipQuery.trim();
      const { data } = await api.get('/api/security/intrusions', { params });
      setIntrusions(Array.isArray(data?.items) ? data.items : []);
      setIntrusionsTotal(Number(data?.total) || 0);
    } catch {
      setIntrusions([]);
      setIntrusionsTotal(0);
    }
  }, [severity, mode, ipQuery]);

  // Rafraîchissement automatique des agrégats toutes les 30 s
  useEffect(() => {
    loadStats();
    const id = window.setInterval(() => loadStats(true), 30000);
    return () => window.clearInterval(id);
  }, [loadStats]);

  // Rechargement du journal à chaque changement de filtre (avec anti-rebond IP)
  useEffect(() => {
    const t = window.setTimeout(() => { loadIntrusions(); }, 300);
    return () => window.clearTimeout(t);
  }, [loadIntrusions]);

  /** Purge complète du journal des intrusions */
  const handlePurge = async () => {
    setPurging(true);
    try {
      await api.delete('/api/security/intrusions');
      toast.success('Journal des intrusions réinitialisé');
      setConfirmPurge(false);
      await Promise.all([loadStats(true), loadIntrusions()]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Réinitialisation impossible');
    } finally {
      setPurging(false);
    }
  };

  const iStats = stats?.intrusionStats || null;

  /** Cartes de statistiques principales */
  const metrics = useMemo(() => ([
    { label: 'Empreintes suivies', value: stats?.profiles ?? 0, icon: Fingerprint, tone: 'from-indigo-500 to-violet-500' },
    { label: 'Bannissements actifs', value: stats?.bans.length ?? 0, icon: Ban, tone: 'from-rose-500 to-red-500' },
    { label: 'Intrusions (24 h)', value: iStats?.last24h ?? 0, icon: Activity, tone: 'from-amber-500 to-orange-500' },
    { label: 'Requêtes bloquées', value: iStats?.blocked ?? 0, icon: ShieldCheck, tone: 'from-emerald-500 to-teal-600' },
  ]), [stats, iStats]);

  /** Liste des modes d'attaque disponibles pour le filtre */
  const modeOptions = useMemo(
    () => (iStats?.topModes || []).map((m) => m.key),
    [iStats],
  );

  const resetFilters = () => { setSeverity('all'); setMode('all'); setIpQuery(''); };
  const hasFilters = severity !== 'all' || mode !== 'all' || !!ipQuery.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold">Bouclier anti-intrusion</h3>
            <p className="text-xs text-muted-foreground">Supervision en direct · rafraîchi toutes les 30 s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminPrincipal && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
              onClick={() => setConfirmPurge(true)}
              disabled={purging}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Purger
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { loadStats(); loadIntrusions(); }} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <PremiumLoading text="Analyse du bouclier" size="sm" />
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Cartes de statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center gap-3">
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

          {/* 2. Répartition par sévérité + modes d'attaque */}
          {iStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Répartition par sévérité</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['critique', 'eleve', 'moyen', 'faible'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(severity === s ? 'all' : s)}
                      className={`rounded-lg border px-2 py-2 text-center transition ${severityStyles[s]} ${severity === s ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                    >
                      <p className="text-lg font-black leading-none">{iStats.bySeverity?.[s] ?? 0}</p>
                      <p className="text-[10px] uppercase font-semibold mt-1">{s}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Modes d'attaque les plus fréquents</p>
                {(iStats.topModes || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun mode détecté.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {iStats.topModes.slice(0, 10).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMode(mode === m.key ? 'all' : m.key)}
                        className={`text-[11px] font-mono px-2 py-1 rounded-md border transition ${mode === m.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 border-border/60 hover:bg-muted'}`}
                      >
                        {m.key} · {m.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IP et navigateurs les plus vus */}
          {iStats && ((iStats.topIps || []).length > 0 || (iStats.topBrowsers || []).length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Adresses IP les plus actives</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(iStats.topIps || []).map((i) => (
                    <button
                      key={i.key}
                      type="button"
                      onClick={() => setIpQuery(ipQuery === i.key ? '' : i.key)}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition ${ipQuery === i.key ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <span className="text-xs font-mono truncate flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-muted-foreground shrink-0" /> {i.key}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground">{i.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Navigateurs / clients</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(iStats.topBrowsers || []).map((b) => (
                    <div key={b.key} className="flex items-center justify-between gap-2 px-2 py-1.5">
                      <span className="text-xs truncate">{b.key}</span>
                      <span className="text-[11px] font-bold text-muted-foreground">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Filtres + tableau détaillé des intrusions */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Journal des intrusions
                <span className="normal-case font-semibold text-muted-foreground/80">
                  ({intrusions.length} affichée{intrusions.length > 1 ? 's' : ''} / {intrusionsTotal})
                </span>
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                  <X className="w-3.5 h-3.5 mr-1" /> Réinitialiser les filtres
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue placeholder="Sévérité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sévérités</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="eleve">Élevée</SelectItem>
                  <SelectItem value="moyen">Moyenne</SelectItem>
                  <SelectItem value="faible">Faible</SelectItem>
                </SelectContent>
              </Select>

              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue placeholder="Mode d'attaque" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  {modeOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={ipQuery}
                  onChange={(e) => setIpQuery(e.target.value)}
                  placeholder="Filtrer par adresse IP"
                  className="h-9 pl-8 rounded-lg text-xs"
                />
              </div>
            </div>

            {intrusions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucune intrusion enregistrée pour ces critères.</p>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-lg border border-border/60">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-bold">Date</th>
                      <th className="px-3 py-2 font-bold">Sévérité</th>
                      <th className="px-3 py-2 font-bold">Modes</th>
                      <th className="px-3 py-2 font-bold">IP</th>
                      <th className="px-3 py-2 font-bold">Requête</th>
                      <th className="px-3 py-2 font-bold">Client</th>
                      <th className="px-3 py-2 font-bold">Action</th>
                      <th className="px-3 py-2 font-bold text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intrusions.map((it, idx) => (
                      <tr key={it.id || idx} className="border-t border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{fmt(it.at ?? it.ts)}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${severityStyles[it.severity || ''] || 'bg-muted text-muted-foreground border-border'}`}>
                            {it.severity || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 max-w-[180px]">
                          <span className="font-mono text-[11px] break-words">{(it.tags && it.tags.length ? it.tags.join(', ') : it.modes) || '—'}</span>
                        </td>
                        <td className="px-3 py-2 font-mono whitespace-nowrap">{it.ip || '—'}</td>
                        <td className="px-3 py-2 max-w-[240px]">
                          <span className="font-mono text-[11px] break-all">{it.method ? `${it.method} ` : ''}{it.url || it.path || '—'}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                          {[it.browser, it.os, it.device].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${actionStyles[it.action || ''] || 'bg-muted text-muted-foreground'}`}>
                            {it.action || '—'}
                          </span>
                          {it.banUntil && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">jusqu'au {fmt(it.banUntil)}</p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold">{it.score ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bannissements actifs */}
          {(stats?.bans.length ?? 0) > 0 && (
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

          {/* Incidents récents (journal rotatif en mémoire) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Derniers incidents</p>
            {(stats?.recentIncidents.length ?? 0) === 0 ? (
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

      {/* Confirmation de purge (administrateur principale) */}
      <AlertDialog open={confirmPurge} onOpenChange={setConfirmPurge}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purger le journal des intrusions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les intrusions enregistrées seront définitivement supprimées de la base
              de données. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-rose-600">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handlePurge(); }} disabled={purging}>
              {purging ? 'Purge…' : 'Purger'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ShieldStatsCard;
