/**
 * HistoriqueConnexionCard.tsx — Carte "Historique des connexions"
 *
 * Affiche en haut les compteurs visites (jour / semaine / mois / année).
 * Liste toutes les sessions (groupées par personne + IP + navigateur).
 * Au clic, ouvre un modal détaillé avec:
 *  - profil (visiteur / admin / admin principale), e-mail, rôle
 *  - IP, navigateur, OS, type d'appareil
 *  - pages consultées (qu'est-ce qu'il a regardé)
 *  - toutes les entrées brutes (login, échec, blocage, visites)
 *
 * Réinitialisation: vide la base. Les nouvelles connexions/visites
 * recommencent à être comptées à partir de 0.
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, RotateCcw, Smartphone, Monitor, Tablet, CheckCircle, XCircle, Lock,
  Globe, Eye, Trash2, Calendar, CalendarDays, CalendarRange, CalendarCheck,
  Crown, ShieldCheck, User as UserIcon, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import historiqueConnexionApi, { HistoriqueEntry } from '@/services/api/historiqueConnexionApi';
import { realtimeService } from '@/services/realtimeService';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const cardClass = "relative rounded-2xl backdrop-blur-2xl bg-white/80 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 shadow-xl overflow-hidden";

const typeColor = (t: string) => {
  switch (t) {
    case 'login_success': return 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30';
    case 'login_failed': return 'text-orange-600 bg-orange-500/15 border-orange-500/30';
    case 'login_locked': return 'text-red-600 bg-red-500/15 border-red-500/30';
    case 'visit': return 'text-sky-600 bg-sky-500/15 border-sky-500/30';
    default: return 'text-gray-600 bg-gray-500/15 border-gray-500/30';
  }
};
const typeIcon = (t: string) => {
  switch (t) {
    case 'login_success': return <CheckCircle className="w-3 h-3" />;
    case 'login_failed': return <XCircle className="w-3 h-3" />;
    case 'login_locked': return <Lock className="w-3 h-3" />;
    case 'visit': return <Eye className="w-3 h-3" />;
    default: return <Activity className="w-3 h-3" />;
  }
};
const typeLabel = (t: string) => ({
  login_success: 'Connexion réussie',
  login_failed: 'Échec',
  login_locked: 'Bloqué',
  visit: 'Visite',
} as Record<string, string>)[t] || t;

const deviceIcon = (d?: string) => {
  if (d === 'Mobile') return <Smartphone className="w-3.5 h-3.5" />;
  if (d === 'Tablet') return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch { return iso; }
};

// ============ ROLE HELPER ============
const roleLabel = (e: HistoriqueEntry) => {
  const r = (e.userRole || '').toLowerCase().trim();
  if (!e.userId) return 'Visiteur';
  if (r.includes('principal')) return 'Administrateur principal';
  if (r.includes('admin')) return 'Administrateur';
  return e.userRole || 'Utilisateur';
};
const roleBadgeClass = (label: string) => {
  if (label.includes('principal')) return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
  if (label.toLowerCase().includes('admin')) return 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white';
  if (label === 'Visiteur') return 'bg-sky-500/15 text-sky-600 border border-sky-500/30';
  return 'bg-gray-500/15 text-gray-700 border border-gray-500/30';
};
const RoleIcon: React.FC<{ label: string }> = ({ label }) => {
  if (label.includes('principal')) return <Crown className="w-3 h-3" />;
  if (label.toLowerCase().includes('admin')) return <ShieldCheck className="w-3 h-3" />;
  return <UserIcon className="w-3 h-3" />;
};

// ============ COUNTERS HELPERS ============
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay() || 7; // lundi = 1
  x.setDate(x.getDate() - (day - 1));
  return x;
};
const startOfMonth = (d: Date) => { const x = startOfDay(d); x.setDate(1); return x; };
const startOfYear  = (d: Date) => { const x = startOfDay(d); x.setMonth(0,1); return x; };

// ============ GROUPING ============
type SessionGroup = {
  key: string;
  name: string;
  email?: string;
  role: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  userId?: string;
  first: HistoriqueEntry;
  last: HistoriqueEntry;
  entries: HistoriqueEntry[];
};

const groupEntries = (entries: HistoriqueEntry[]): SessionGroup[] => {
  const map = new Map<string, SessionGroup>();
  // entries arrive du plus récent en premier
  for (const e of entries) {
    const id = e.userId || e.userEmail || 'anon';
    const key = `${id}__${e.ip || 'noip'}__${e.browser || ''}__${e.os || ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(e);
      // first = la plus ancienne, last = la plus récente
      if (new Date(e.date) < new Date(existing.first.date)) existing.first = e;
      if (new Date(e.date) > new Date(existing.last.date)) existing.last = e;
    } else {
      map.set(key, {
        key,
        name: e.userName || e.userEmail || 'Visiteur anonyme',
        email: e.userEmail,
        role: roleLabel(e),
        ip: e.ip || 'IP inconnue',
        browser: e.browser || 'Inconnu',
        os: e.os || 'Inconnu',
        device: e.device || 'Desktop',
        userId: e.userId,
        first: e,
        last: e,
        entries: [e],
      });
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.last.date).getTime() - new Date(a.last.date).getTime()
  );
};

const HistoriqueConnexionCard: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SessionGroup | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await historiqueConnexionApi.getAll();
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('historique fetch error:', e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Synchronisation temps réel via SSE — refetch uniquement quand
  // le fichier historique-connexion.json change sur le serveur.
  useEffect(() => {
    realtimeService.connect();
    const unsubscribe = realtimeService.addSyncListener((event) => {
      if (event?.type === 'data-changed' && event?.data?.type === 'historique-connexion') {
        fetchEntries();
      }
      if (event?.type === 'force-sync') {
        fetchEntries();
      }
    });
    return () => {
      unsubscribe();
      realtimeService.disconnect();
    };
  }, [fetchEntries]);

  const handleReset = async () => {
    try {
      setResetting(true);
      await historiqueConnexionApi.reset();
      setEntries([]);
      toast({ title: '✅ Historique réinitialisé', description: 'Le comptage repart de 0', className: 'bg-green-600 text-white border-green-600' });
      setConfirmReset(false);
    } catch (e: any) {
      toast({ title: 'Erreur', description: 'Impossible de réinitialiser', variant: 'destructive' });
    } finally { setResetting(false); }
  };

  // ============ STATS PÉRIODES (visites = login_success + visit) ============
  const periodStats = useMemo(() => {
    const now = new Date();
    const sDay = startOfDay(now).getTime();
    const sWeek = startOfWeek(now).getTime();
    const sMonth = startOfMonth(now).getTime();
    const sYear = startOfYear(now).getTime();
    let day = 0, week = 0, month = 0, year = 0;
    for (const e of entries) {
      if (e.type !== 'visit' && e.type !== 'login_success') continue;
      const t = new Date(e.date).getTime();
      if (isNaN(t)) continue;
      if (t >= sYear) year++;
      if (t >= sMonth) month++;
      if (t >= sWeek) week++;
      if (t >= sDay) day++;
    }
    return { day, week, month, year };
  }, [entries]);

  const groups = useMemo(() => groupEntries(entries), [entries]);

  // Années disponibles dans l'historique
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) {
      const t = new Date(e.date);
      if (!isNaN(t.getTime())) set.add(t.getFullYear());
    }
    set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [entries]);

  // Filtrer les entrées selon la période sélectionnée
  const filteredEntries = useMemo(() => {
    const now = new Date();
    let start: number;
    let end: number = Infinity;
    if (period === 'day') start = startOfDay(now).getTime();
    else if (period === 'week') start = startOfWeek(now).getTime();
    else if (period === 'month') start = startOfMonth(now).getTime();
    else {
      // year — utilise l'année sélectionnée
      start = new Date(selectedYear, 0, 1).getTime();
      end = new Date(selectedYear + 1, 0, 1).getTime();
    }
    return entries.filter(e => {
      const t = new Date(e.date).getTime();
      return !isNaN(t) && t >= start && t < end;
    });
  }, [entries, period, selectedYear]);

  const filteredGroups = useMemo(() => groupEntries(filteredEntries), [filteredEntries]);
  const previewGroups = filteredGroups.slice(0, 4);

  const periodCardBase = "rounded-xl border p-2 text-center transition-all cursor-pointer hover:scale-[1.03]";
  const isActive = (p: string) => period === p ? 'ring-2 ring-offset-1 ring-offset-background scale-[1.02]' : 'opacity-70 hover:opacity-100';

  // ============ RENDER ROW (groupe) ============
  const renderGroupRow = (g: SessionGroup) => {
    const visitCount = g.entries.filter(e => e.type === 'visit' || e.type === 'login_success').length;
    return (
      <button
        key={g.key}
        onClick={() => setSelectedGroup(g)}
        className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white/5 dark:bg-white/[0.02] border border-white/10 hover:border-sky-400/40 hover:bg-white/10 transition-all"
      >
        <div className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 ${roleBadgeClass(g.role)}`}>
          <RoleIcon label={g.role} /> {g.role}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">
            {g.name}
            <span className="ml-2 text-[10px] font-medium text-muted-foreground">• {g.entries.length} entrée{g.entries.length > 1 ? 's' : ''} • {visitCount} visite{visitCount > 1 ? 's' : ''}</span>
          </p>
          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1">{deviceIcon(g.device)} {g.browser} • {g.os}</span>
            <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {g.ip}</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Dernière activité: {fmtDate(g.last.date)}
          </p>
        </div>
      </button>
    );
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Historique des connexions</span>
                <p className="text-[11px] text-muted-foreground">Sessions, appareils, pages visitées</p>
              </div>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              title="Réinitialiser l'historique"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 transition-all hover:scale-110"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* COMPTEURS PÉRIODES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setPeriod('day')}
              className={`${periodCardBase} bg-emerald-500/10 border-emerald-500/20 ring-emerald-500 ${isActive('day')}`}
            >
              <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-center gap-1"><Calendar className="w-3 h-3" /> Jour</p>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{periodStats.day}</p>
            </button>
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`${periodCardBase} bg-sky-500/10 border-sky-500/20 ring-sky-500 ${isActive('week')}`}
            >
              <p className="text-[10px] font-bold text-sky-600 uppercase flex items-center justify-center gap-1"><CalendarDays className="w-3 h-3" /> Semaine</p>
              <p className="text-base font-black text-sky-700 dark:text-sky-300">{periodStats.week}</p>
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`${periodCardBase} bg-violet-500/10 border-violet-500/20 ring-violet-500 ${isActive('month')}`}
            >
              <p className="text-[10px] font-bold text-violet-600 uppercase flex items-center justify-center gap-1"><CalendarRange className="w-3 h-3" /> Mois</p>
              <p className="text-base font-black text-violet-700 dark:text-violet-300">{periodStats.month}</p>
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`${periodCardBase} bg-amber-500/10 border-amber-500/20 ring-amber-500 ${isActive('year')}`}
            >
              <p className="text-[10px] font-bold text-amber-600 uppercase flex items-center justify-center gap-1"><CalendarCheck className="w-3 h-3" /> Année</p>
              <p className="text-base font-black text-amber-700 dark:text-amber-300">{periodStats.year}</p>
            </button>
          </div>

          {/* Sélecteur d'année (visible uniquement en mode "année") */}
          {period === 'year' && (
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <span className="text-[11px] font-bold text-amber-600 uppercase">Choisir l'année</span>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v, 10))}>
                <SelectTrigger className="h-8 w-28 rounded-xl text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y} value={String(y)} className="text-xs font-bold">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-1">
            {period === 'day' && "Sessions d'aujourd'hui"}
            {period === 'week' && 'Sessions de la semaine'}
            {period === 'month' && 'Sessions du mois'}
            {period === 'year' && `Sessions de ${selectedYear}`}
            <span className="ml-1 text-muted-foreground/60">({filteredGroups.length})</span>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {loading && <p className="text-xs text-muted-foreground text-center py-4">Chargement…</p>}
            {!loading && filteredGroups.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Aucune entrée pour cette période</p>
            )}
            {!loading && previewGroups.map(renderGroupRow)}
          </div>

          {filteredGroups.length > previewGroups.length && (
            <Button
              onClick={() => setShowAll(true)}
              variant="ghost"
              className="w-full mt-3 rounded-xl text-xs font-bold text-sky-600 hover:bg-sky-500/10"
            >
              Voir toutes les sessions ({filteredGroups.length})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Modal liste complète des sessions */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-sky-300/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-500" /> Toutes les sessions ({filteredGroups.length})
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] space-y-2 pr-2">
            {filteredGroups.map(renderGroupRow)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal détail d'une session */}
      <Dialog open={!!selectedGroup} onOpenChange={(o) => !o && setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-sky-300/30">
          {selectedGroup && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" /> Détails de la session
                </DialogTitle>
              </DialogHeader>

              <div className="overflow-y-auto max-h-[72vh] pr-2 space-y-4">
                {/* Profil */}
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 ${roleBadgeClass(selectedGroup.role)}`}>
                      <RoleIcon label={selectedGroup.role} /> {selectedGroup.role}
                    </span>
                    <p className="text-sm font-bold text-foreground">{selectedGroup.name}</p>
                  </div>
                  {selectedGroup.email && (
                    <p className="text-xs text-muted-foreground">Email: <span className="font-mono">{selectedGroup.email}</span></p>
                  )}
                  {selectedGroup.userId && (
                    <p className="text-xs text-muted-foreground">ID utilisateur: <span className="font-mono">{selectedGroup.userId}</span></p>
                  )}
                </div>

                {/* Appareil / réseau */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse IP</p>
                    <p className="text-sm font-mono font-bold text-foreground break-all">{selectedGroup.ip}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">{deviceIcon(selectedGroup.device)} Appareil</p>
                    <p className="text-sm font-bold text-foreground">{selectedGroup.browser} • {selectedGroup.os}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedGroup.device}</p>
                  </div>
                </div>

                {/* Pages consultées */}
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Pages consultées
                  </p>
                  {(() => {
                    const pages = selectedGroup.entries
                      .filter(e => e.page)
                      .map(e => ({ page: e.page as string, date: e.date }));
                    const seen = new Set<string>();
                    const unique = pages.filter(p => { if (seen.has(p.page)) return false; seen.add(p.page); return true; });
                    if (unique.length === 0) return <p className="text-xs text-muted-foreground">Aucune page enregistrée</p>;
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {unique.map(p => (
                          <span key={p.page} className="px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-[11px] font-mono text-sky-700 dark:text-sky-300">
                            {p.page}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Chronologie */}
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Chronologie ({selectedGroup.entries.length})</p>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {[...selectedGroup.entries]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(e => (
                        <div key={e.id} className="flex items-start gap-2 text-[11px] px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border ${typeColor(e.type)}`}>
                            {typeIcon(e.type)} {typeLabel(e.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            {e.page && <p className="font-mono text-sky-700 dark:text-sky-300 truncate">{e.page}</p>}
                            {e.message && <p className="text-muted-foreground truncate">{e.message}</p>}
                            <p className="text-muted-foreground/60">{fmtDate(e.date)}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* User-Agent brut */}
                {selectedGroup.last.userAgent && (
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">User-Agent</p>
                    <p className="text-[11px] font-mono text-foreground/80 break-all">{selectedGroup.last.userAgent}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm reset */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Réinitialiser l'historique
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera <strong>toutes les entrées</strong> ({entries.length}) de l'historique des connexions et visites.
              Les compteurs jour / semaine / mois / année repartiront de 0.
              Les nouvelles connexions et visites seront enregistrées normalement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button onClick={handleReset} disabled={resetting}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600">
              {resetting ? 'Suppression…' : 'Confirmer la réinitialisation'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HistoriqueConnexionCard;
