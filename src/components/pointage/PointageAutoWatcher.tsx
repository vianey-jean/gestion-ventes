/**
 * PointageAutoWatcher — Surveillance globale des pointages automatiques
 *
 * Composant monté globalement dans App.tsx (uniquement quand l'utilisateur est
 * connecté). Toutes les 60 secondes :
 *  1. Récupère les règles actives dans pointageauto.json
 *  2. Filtre celles qui correspondent à AUJOURD'HUI (jour de semaine)
 *  3. Pour chaque règle, vérifie si le pointage existe déjà dans pointage.json
 *     (même date + travailleurId + entrepriseId) — si oui, on skip.
 *  4. Sinon, on ajoute la règle dans une file d'attente.
 *
 * Pour chaque règle en attente, un chrono de 10 minutes (préavis) démarre.
 * À l'expiration, un MODAL FIXE en haut à droite apparaît (non fermable),
 * avec un compte à rebours de 5 minutes et 2 boutons : "Valider" / "Annuler".
 *  - Valider → crée le pointage dans pointage.json
 *  - Annuler → ignore (pointage manuel attendu)
 *  - Si le chrono atteint 0 → validation automatique
 *
 * Si pendant le préavis, un pointage manuel correspondant est créé,
 * la règle correspondante est retirée de la file (les autres continuent).
 *
 * Design : modal ultra luxe inspiré du Module Comptabilité.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Diamond, Zap, Check, X, Clock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pointageAutoApi, { PointageAutoEntry } from '@/services/api/pointageAutoApi';
import pointageApi from '@/services/api/pointageApi';
import { useToast } from '@/hooks/use-toast';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

interface QueueItem {
  rule: PointageAutoEntry;
  /** Date YYYY-MM-DD pour laquelle on prévoit le pointage */
  date: string;
  /** Timestamp ms à partir duquel le modal doit s'afficher (preavis 10min) */
  showAt: number;
}

const POLL_INTERVAL = 60_000;       // 60s
const PREAVIS_MS = 10 * 60 * 1000;  // 10 min
const MODAL_COUNTDOWN_S = 5 * 60;   // 5 min

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ruleAppliesToday = (rule: PointageAutoEntry): boolean => {
  if (!rule.active) return false;
  if (rule.jours === 'toute') return true;
  if (Array.isArray(rule.jours)) {
    const today = JOURS[new Date().getDay()];
    return rule.jours.includes(today);
  }
  return false;
};

/** Vérifie si la règle s'applique à une date donnée (selon ses jours configurés) */
const ruleAppliesToDate = (rule: PointageAutoEntry, date: Date): boolean => {
  if (!rule.active) return false;
  if (rule.jours === 'toute') return true;
  if (Array.isArray(rule.jours)) {
    return rule.jours.includes(JOURS[date.getDay()]);
  }
  return false;
};

const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Retourne toutes les dates pour lesquelles la règle aurait dû déclencher un pointage.
 * - Borne basse : reactivationStartDate si fournie, sinon le 1er du mois courant.
 * - Borne haute : AUJOURD'HUI inclus.
 * Permet le rattrapage rétroactif même au-delà du mois courant si une date
 * de réactivation passée (ex: -5 jours) a été saisie.
 */
const getExpectedDatesThisMonth = (rule: PointageAutoEntry): string[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Calcule la date de départ
  let start: Date;
  if (rule.reactivationStartDate) {
    const [y, m, d] = rule.reactivationStartDate.split('-').map(Number);
    start = new Date(y, (m || 1) - 1, d || 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  start.setHours(0, 0, 0, 0);

  // Garde-fou : ne jamais remonter plus de 60 jours en arrière
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
  const [activeModal, setActiveModal] = useState<QueueItem | null>(null);
  const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_S);
  const processedRef = useRef<Set<string>>(new Set());

  const keyOf = (date: string, ruleId: string) => `${date}__${ruleId}`;

  /** Vérifie si un pointage manuel correspond déjà à la règle pour la date donnée */
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

  /** Scan principal — appelé toutes les 60s */
  const scan = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await pointageAutoApi.getAll();
      const allRules = (res.data || []).filter(r => r.active);

      // Récupère TOUS les pointages du mois en cours (1 seul fetch optimisé)
      const now = new Date();
      const monthRes = await pointageApi.getByMonth(now.getFullYear(), now.getMonth() + 1);
      const monthList = monthRes.data || [];
      const hasPointage = (date: string, rule: PointageAutoEntry): boolean =>
        monthList.some(p =>
          p.date === date &&
          p.travailleurId === rule.travailleurId &&
          p.entrepriseId === rule.entrepriseId
        );

      const today = todayStr();
      const newItems: QueueItem[] = [];

      for (const rule of allRules) {
        // 1) Vérifie tous les jours attendus du mois (rétroactif) — jours manqués
        const expectedDates = getExpectedDatesThisMonth(rule);
        for (const date of expectedDates) {
          const k = keyOf(date, rule.id);
          if (processedRef.current.has(k)) continue;
          if (hasPointage(date, rule)) {
            processedRef.current.add(k);
            continue;
          }
          if (queue.some(q => q.rule.id === rule.id && q.date === date)) continue;
          if (activeModal && activeModal.rule.id === rule.id && activeModal.date === date) continue;

          // Pour les jours PASSÉS manqués → showAt immédiat (préavis 0)
          // Pour AUJOURD'HUI → préavis normal de 10 min
          const isToday = date === today;
          newItems.push({
            rule,
            date,
            showAt: isToday ? Date.now() + PREAVIS_MS : Date.now(),
          });
        }
      }
      if (newItems.length > 0) {
        setQueue(prev => [...prev, ...newItems]);
      }
    } catch {
      // silencieux
    }
  }, [isAuthenticated, queue, activeModal]);

  // Démarrer le polling
  useEffect(() => {
    if (!isAuthenticated) return;
    scan();
    const id = window.setInterval(scan, POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [isAuthenticated, scan]);

  // Reset processed map quand le jour change
  useEffect(() => {
    const id = window.setInterval(() => {
      // Nettoie les clés qui ne correspondent plus à aujourd'hui
      const today = todayStr();
      const next = new Set<string>();
      processedRef.current.forEach(k => { if (k.startsWith(today)) next.add(k); });
      processedRef.current = next;
    }, 60 * 60 * 1000); // chaque heure
    return () => window.clearInterval(id);
  }, []);

  // Promote queue items dont le préavis est écoulé vers le modal actif
  useEffect(() => {
    if (activeModal) return;
    const id = window.setInterval(async () => {
      const now = Date.now();
      const next = queue.find(q => q.showAt <= now);
      if (next) {
        // Re-vérifier si pointage manuel n'a pas été fait entre temps
        if (await pointageExists(next.rule, next.date)) {
          processedRef.current.add(keyOf(next.date, next.rule.id));
          setQueue(q => q.filter(x => !(x.rule.id === next.rule.id && x.date === next.date)));
          return;
        }
        setQueue(q => q.filter(x => !(x.rule.id === next.rule.id && x.date === next.date)));
        setActiveModal(next);
        setCountdown(MODAL_COUNTDOWN_S);
      }
    }, 5_000);
    return () => window.clearInterval(id);
  }, [activeModal, queue]);

  // Countdown du modal
  useEffect(() => {
    if (!activeModal) return;
    if (countdown <= 0) {
      // Validation automatique
      void handleValidate(true);
      return;
    }
    const id = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, countdown]);

  const handleValidate = async (isAuto = false) => {
    if (!activeModal) return;
    const { rule, date } = activeModal;
    try {
      // Re-vérifier avant création
      if (await pointageExists(rule, date)) {
        toast({ title: 'Pointage déjà existant', description: 'Un pointage manuel a été détecté' });
      } else {
        await pointageApi.create({
          date,
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
      processedRef.current.add(keyOf(date, rule.id));
      setActiveModal(null);
    }
  };

  const handleCancel = () => {
    if (!activeModal) return;
    const { rule, date } = activeModal;
    processedRef.current.add(keyOf(date, rule.id));
    toast({ title: 'Pointage annulé', description: 'Pensez à le saisir manuellement si besoin' });
    setActiveModal(null);
  };

  if (!isAuthenticated || !activeModal) return null;

  const m = Math.floor(countdown / 60);
  const s = countdown % 60;
  const r = activeModal.rule;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', damping: 22 }}
        className="fixed top-4 right-4 z-[200] w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-green-900/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/40 backdrop-blur-2xl overflow-hidden"
      >
        {/* Decoratives */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-tr-full pointer-events-none" />

        {/* Header */}
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
                <Sparkles className="w-3 h-3" /> Confirmation requise
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative p-4 space-y-3">
          {/* Compte à rebours */}
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

          {/* Détails */}
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
              <span>Date : {activeModal.date}</span>
            </div>
          </div>

          {/* Boutons */}
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
