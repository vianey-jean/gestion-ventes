/**
 * PointageAutoWatcher — Surveillance globale des pointages automatiques
 *
 * ▶ Synchronisation MULTI-ADMIN via server/db/pointageAutoSessions.json :
 *   - Quand une règle doit déclencher une notification, une SESSION partagée
 *     est créée côté serveur (POST /api/pointages-auto-sessions).
 *   - Tous les admins connectés récupèrent la session et affichent le MÊME
 *     compte à rebours (calculé à partir de expiresAt).
 *   - Si un admin valide → la session passe à 'validated', le pointage est
 *     créé, tous les autres admins voient le modal disparaître.
 *   - Si un admin annule → la session passe à 'cancelled' ET une empreinte est
 *     ajoutée dans pointageDeleted.json. Conséquence : plus aucun pointage
 *     automatique ne peut recréer le même pointage (date+personne+entreprise),
 *     même après reconnexion ou réinjection de sauvegarde. Seul un pointage
 *     MANUEL reste possible.
 *
 * Fréquence : toutes les 10s (scan serveur) pour une synchro quasi temps-réel.
 *
 * Préavis 10 min pour AUJOURD'HUI, rattrapage IMMÉDIAT pour jours passés manqués.
 * Durée modal : 5 min (fin = validation auto).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Diamond, Zap, Check, X, Clock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pointageAutoApi, { PointageAutoEntry } from '@/services/api/pointageAutoApi';
import pointageApi from '@/services/api/pointageApi';
import pointageDeletedApi from '@/services/api/pointageDeletedApi';
import pointageAutoSessionsApi, { PointageAutoSession } from '@/services/api/pointageAutoSessionsApi';
import { useToast } from '@/hooks/use-toast';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

interface QueueItem {
  rule: PointageAutoEntry;
  date: string;            // YYYY-MM-DD
  showAt: number;          // timestamp ms
}

const POLL_INTERVAL = 60_000;        // scan règles toutes les 60s
const SESSION_POLL_INTERVAL = 10_000; // synchro session toutes les 10s
const PREAVIS_MS = 10 * 60 * 1000;    // 10 min
const MODAL_COUNTDOWN_MS = 5 * 60 * 1000; // 5 min

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ruleAppliesToDate = (rule: PointageAutoEntry, date: Date): boolean => {
  if (!rule.active) return false;
  if (rule.jours === 'toute') return true;
  if (Array.isArray(rule.jours)) return rule.jours.includes(JOURS[date.getDay()]);
  return false;
};

const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getExpectedDatesThisMonth = (rule: PointageAutoEntry): string[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let start: Date;
  if (rule.reactivationStartDate) {
    const [y, m, d] = rule.reactivationStartDate.split('-').map(Number);
    start = new Date(y, (m || 1) - 1, d || 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  start.setHours(0, 0, 0, 0);
  const maxBack = new Date(now);
  maxBack.setDate(maxBack.getDate() - 60);
  if (start < maxBack) start = maxBack;
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    if (ruleAppliesToDate(rule, cursor)) dates.push(fmtDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const PointageAutoWatcher: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  // Modal actif = session partagée serveur + règle locale
  const [activeSession, setActiveSession] = useState<{
    session: PointageAutoSession;
    rule: PointageAutoEntry;
  } | null>(null);
  const [countdownMs, setCountdownMs] = useState<number>(MODAL_COUNTDOWN_MS);
  const rulesCacheRef = useRef<Map<string, PointageAutoEntry>>(new Map());
  const processedRef = useRef<Set<string>>(new Set());

  const keyOf = (date: string, ruleId: string) => `${date}__${ruleId}`;

  /** Vérifie si un pointage existe pour (date + rule) */
  const pointageExists = async (rule: PointageAutoEntry, date: string): Promise<boolean> => {
    try {
      const res = await pointageApi.getByDate(date);
      const list = res.data || [];
      return list.some(p =>
        p.travailleurId === rule.travailleurId &&
        p.entrepriseId === rule.entrepriseId
      );
    } catch { return false; }
  };

  /** Scan principal : construit la queue locale */
  const scan = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await pointageAutoApi.getAll();
      const allRules = (res.data || []).filter(r => r.active);
      // Cache règles pour lookup rapide dans pollSessions
      const cache = new Map<string, PointageAutoEntry>();
      allRules.forEach(r => cache.set(r.id, r));
      rulesCacheRef.current = cache;

      const now = new Date();
      const monthRes = await pointageApi.getByMonth(now.getFullYear(), now.getMonth() + 1);
      const monthList = monthRes.data || [];
      const hasPointage = (date: string, rule: PointageAutoEntry): boolean =>
        monthList.some(p =>
          p.date === date &&
          p.travailleurId === rule.travailleurId &&
          p.entrepriseId === rule.entrepriseId
        );

      let deletedList: Array<{ date: string; travailleurId: string; entrepriseId: string }> = [];
      try {
        const delRes = await pointageDeletedApi.getAll();
        deletedList = delRes.data || [];
      } catch { /* silencieux */ }
      const isDeletedFingerprint = (date: string, rule: PointageAutoEntry): boolean =>
        deletedList.some(d =>
          d.date === date &&
          (d.travailleurId || '') === (rule.travailleurId || '') &&
          (d.entrepriseId || '') === (rule.entrepriseId || '')
        );

      const today = todayStr();
      const newItems: QueueItem[] = [];

      for (const rule of allRules) {
        const expectedDates = getExpectedDatesThisMonth(rule);
        for (const date of expectedDates) {
          const k = keyOf(date, rule.id);
          if (processedRef.current.has(k)) continue;
          if (hasPointage(date, rule)) {
            processedRef.current.add(k);
            continue;
          }
          // BLOQUE : pointage supprimé OU session déjà annulée (via empreinte)
          if (isDeletedFingerprint(date, rule)) {
            processedRef.current.add(k);
            continue;
          }
          if (queue.some(q => q.rule.id === rule.id && q.date === date)) continue;
          if (activeSession && activeSession.session.ruleId === rule.id && activeSession.session.date === date) continue;

          const isToday = date === today;
          newItems.push({
            rule,
            date,
            showAt: isToday ? Date.now() + PREAVIS_MS : Date.now(),
          });
        }
      }
      if (newItems.length > 0) setQueue(prev => [...prev, ...newItems]);
    } catch { /* silencieux */ }
  }, [isAuthenticated, queue, activeSession]);

  // Scan périodique des règles
  useEffect(() => {
    if (!isAuthenticated) return;
    scan();
    const id = window.setInterval(scan, POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [isAuthenticated, scan]);

  // Purge processed map à chaque heure (garde seulement les clés d'aujourd'hui)
  useEffect(() => {
    const id = window.setInterval(() => {
      const today = todayStr();
      const next = new Set<string>();
      processedRef.current.forEach(k => { if (k.startsWith(today)) next.add(k); });
      processedRef.current = next;
    }, 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  // Promote queue → création de SESSION SERVEUR quand préavis écoulé
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(async () => {
      if (activeSession) return;
      const now = Date.now();
      const next = queue.find(q => q.showAt <= now);
      if (!next) return;

      // Re-check pointage manuel entretemps
      if (await pointageExists(next.rule, next.date)) {
        processedRef.current.add(keyOf(next.date, next.rule.id));
        setQueue(q => q.filter(x => !(x.rule.id === next.rule.id && x.date === next.date)));
        return;
      }

      // Crée (ou récupère) la session partagée côté serveur
      try {
        const sessRes = await pointageAutoSessionsApi.create({
          ruleId: next.rule.id,
          date: next.date,
          travailleurId: next.rule.travailleurId,
          entrepriseId: next.rule.entrepriseId,
          durationMs: MODAL_COUNTDOWN_MS,
        });
        setQueue(q => q.filter(x => !(x.rule.id === next.rule.id && x.date === next.date)));
        const session = sessRes.data;
        setActiveSession({ session, rule: next.rule });
      } catch { /* silencieux, retry au prochain tick */ }
    }, 5_000);
    return () => window.clearInterval(id);
  }, [activeSession, queue, isAuthenticated]);

  // Synchro sessions partagées (multi-admin) toutes les 10s
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollSessions = async () => {
      try {
        const res = await pointageAutoSessionsApi.getAll('pending');
        const pendings = res.data || [];

        // 1) Si j'ai un modal actif → vérifier si la session est toujours pending
        if (activeSession) {
          const still = pendings.find(s => s.id === activeSession.session.id);
          if (!still) {
            // Un autre admin a validé / annulé → fermer silencieusement
            processedRef.current.add(keyOf(activeSession.session.date, activeSession.session.ruleId));
            setActiveSession(null);
            return;
          }
          // Mettre à jour expiresAt éventuellement
          if (still.expiresAt !== activeSession.session.expiresAt) {
            setActiveSession(a => a ? { ...a, session: still } : a);
          }
          return;
        }

        // 2) Pas de modal local → adopter la première session pending applicable
        if (pendings.length > 0) {
          // Charger règles si cache vide
          if (rulesCacheRef.current.size === 0) {
            try {
              const r = await pointageAutoApi.getAll();
              (r.data || []).forEach(rule => rulesCacheRef.current.set(rule.id, rule));
            } catch { /* silencieux */ }
          }
          for (const sess of pendings) {
            const rule = rulesCacheRef.current.get(sess.ruleId);
            if (!rule) continue;
            // Si pointage déjà existant → fermer session
            if (await pointageExists(rule, sess.date)) {
              try { await pointageAutoSessionsApi.update(sess.id, { status: 'validated' }); } catch { /* silencieux */ }
              processedRef.current.add(keyOf(sess.date, sess.ruleId));
              continue;
            }
            setActiveSession({ session: sess, rule });
            break;
          }
        }
      } catch { /* silencieux */ }
    };

    pollSessions();
    const id = window.setInterval(pollSessions, SESSION_POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [isAuthenticated, activeSession]);

  // Countdown dérivé d'expiresAt (partagé entre tous les admins)
  useEffect(() => {
    if (!activeSession) { setCountdownMs(MODAL_COUNTDOWN_MS); return; }
    const tick = () => {
      const remain = new Date(activeSession.session.expiresAt).getTime() - Date.now();
      if (remain <= 0) {
        setCountdownMs(0);
        void handleValidate(true);
        return;
      }
      setCountdownMs(remain);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  const closerId = (user && ((user as any).username || (user as any).id)) || 'admin';

  const handleValidate = async (isAuto = false) => {
    if (!activeSession) return;
    const { session, rule } = activeSession;
    try {
      // Marquer la session validée côté serveur EN PREMIER (idempotent)
      try { await pointageAutoSessionsApi.update(session.id, { status: 'validated', closedBy: closerId }); } catch { /* silencieux */ }

      if (await pointageExists(rule, session.date)) {
        if (!isAuto) toast({ title: 'Pointage déjà existant', description: 'Un pointage manuel a été détecté' });
      } else {
        await pointageApi.create({
          date: session.date,
          entrepriseId: rule.entrepriseId,
          entrepriseNom: rule.entrepriseNom,
          typePaiement: rule.typePaiement,
          heures: rule.heures,
          prixJournalier: rule.prixJournalier,
          prixHeure: rule.prixHeure,
          montantTotal: rule.montantTotal,
          travailleurId: rule.travailleurId,
          travailleurNom: rule.travailleurNom,
        });
        toast({
          title: isAuto ? '⏱️ Pointage auto enregistré' : '✓ Pointage validé',
          description: `${rule.travailleurNom} — ${rule.entrepriseNom}`
        });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le pointage', variant: 'destructive' });
    } finally {
      processedRef.current.add(keyOf(session.date, session.ruleId));
      setActiveSession(null);
    }
  };

  const handleCancel = async () => {
    if (!activeSession) return;
    const { session, rule } = activeSession;
    try {
      // Cancel serveur → ajoute empreinte pointageDeleted (bloque futurs autos)
      await pointageAutoSessionsApi.update(session.id, { status: 'cancelled', closedBy: closerId });
      toast({ title: 'Pointage annulé', description: 'Pensez à le saisir manuellement si besoin' });
    } catch {
      toast({ title: 'Erreur', description: 'Annulation impossible', variant: 'destructive' });
    } finally {
      processedRef.current.add(keyOf(session.date, rule.id));
      setActiveSession(null);
    }
  };

  if (!isAuthenticated || !activeSession) return null;

  const totalSec = Math.max(0, Math.ceil(countdownMs / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const r = activeSession.rule;
  const startedTime = new Date(activeSession.session.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', damping: 22 }}
        className="fixed top-4 right-4 z-[200] w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-green-900/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/40 backdrop-blur-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-tr-full pointer-events-none" />

        <div className="relative p-4 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-base font-black bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent flex items-center gap-1.5">
                Pointage automatique
                <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-emerald-200/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Déclenché à {startedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-4 space-y-3">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
                Validation auto dans
              </span>
            </div>
            <div className="text-4xl font-black bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent tabular-nums">
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-white/5 border border-emerald-400/20 p-3">
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <User className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-semibold">{r.travailleurNom}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{r.entrepriseNom}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <Diamond className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {r.typePaiement === 'horaire'
                  ? `${r.heures}h × ${r.prixHeure}€`
                  : `Journalier ${r.prixJournalier}€`}
              </span>
              <span className="ml-auto font-black text-emerald-300">{r.montantTotal}€</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-200/80">
              <Clock className="w-3 h-3" />
              <span>Date : {activeSession.session.date}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-red-400/30 text-red-200 hover:bg-red-500/10 transition font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Annuler
            </button>
            <button
              onClick={() => handleValidate(false)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/40 transition font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Valider
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PointageAutoWatcher;
