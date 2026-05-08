/**
 * GlobalRdvTodayNotifier
 * Affiche une notification verte en bas-droite pour chaque RDV du jour,
 * une par une, en boucle, glissant de droite vers la gauche.
 * Visible sur toutes les pages tant que l'utilisateur est authentifié.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, X, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import rdvApiService from '@/services/api/rdvApi';
import type { RDV } from '@/types/rdv';

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const GlobalRdvTodayNotifier: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [todayRdvs, setTodayRdvs] = useState<RDV[]>([]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState(false);

  // Charger les RDV du jour, refresh toutes les 60s
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      try {
        const all = await rdvApiService.getAll();
        const today = todayISO();
        const filtered = (all || []).filter(r =>
          r.date === today && r.statut !== 'annule' && r.statut !== 'termine'
        );
        if (!cancelled) setTodayRdvs(filtered);
      } catch {
        // silencieux
      }
    };
    load();
    const itv = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(itv); };
  }, [isAuthenticated]);

  // Rotation auto entre les RDV
  const visibleRdvs = todayRdvs.filter(r => !dismissed.has(r.id));
  useEffect(() => {
    if (visibleRdvs.length <= 1) return;
    const itv = setInterval(() => {
      setIndex(prev => (prev + 1) % visibleRdvs.length);
    }, 6000);
    return () => clearInterval(itv);
  }, [visibleRdvs.length]);

  useEffect(() => {
    if (index >= visibleRdvs.length) setIndex(0);
  }, [visibleRdvs.length, index]);

  if (!isAuthenticated || hidden || visibleRdvs.length === 0) return null;
  const current = visibleRdvs[index];
  if (!current) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9998] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="pointer-events-auto w-[92vw] sm:w-[360px] rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/40 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex items-start gap-3 p-4">
            <div className="shrink-0 mt-0.5 rounded-full bg-white/20 p-2 animate-pulse">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                  RDV aujourd'hui {visibleRdvs.length > 1 ? `(${index + 1}/${visibleRdvs.length})` : ''}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDismissed(prev => new Set(prev).add(current.id))}
                    title="Ignorer ce RDV"
                    className="rounded-full p-1 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setHidden(true)}
                    title="Masquer toutes"
                    className="rounded-full px-1.5 text-[10px] font-bold hover:bg-white/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm font-bold truncate">{current.titre || 'Rendez-vous'}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs opacity-95">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{current.clientNom}</span>
              </div>
              <div className="mt-0.5 text-xs font-mono opacity-95">
                {current.heureDebut} → {current.heureFin}
              </div>
              {current.lieu && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs opacity-90">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{current.lieu}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalRdvTodayNotifier;
