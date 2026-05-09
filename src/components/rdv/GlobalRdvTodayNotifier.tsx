/**
 * GlobalRdvTodayNotifier
 * --------------------------------------------------------
 * VERSION ULTRA LUXE / MODERNE
 * --------------------------------------------------------
 * ✔ Mode minimisé ultra animé
 * ✔ Hover = stop toutes les animations
 * ✔ Hover = ouverture complète
 * ✔ Glassmorphism premium
 * ✔ Glow dynamique
 * ✔ Rotation automatique des RDV
 * ✔ UX premium moderne
 * --------------------------------------------------------
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  X,
  MapPin,
  User,
} from 'lucide-react';

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

  // Hover ouverture
  const [hovered, setHovered] = useState(false);

  /**
   * Charger les RDV
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const load = async () => {
      try {
        const all = await rdvApiService.getAll();

        const today = todayISO();

        const filtered = (all || []).filter(
          (r) =>
            r.date === today &&
            r.statut !== 'annule' &&
            r.statut !== 'termine'
        );

        if (!cancelled) {
          setTodayRdvs(filtered);
        }
      } catch {
        // silencieux
      }
    };

    load();

    const itv = setInterval(load, 60000);

    return () => {
      cancelled = true;
      clearInterval(itv);
    };
  }, [isAuthenticated]);

  /**
   * RDV visibles
   */
  const visibleRdvs = useMemo(
    () => todayRdvs.filter((r) => !dismissed.has(r.id)),
    [todayRdvs, dismissed]
  );

  /**
   * Rotation auto
   * STOP quand hover
   */
  useEffect(() => {
    if (hovered) return;

    if (visibleRdvs.length <= 1) return;

    const itv = setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleRdvs.length);
    }, 6000);

    return () => clearInterval(itv);
  }, [visibleRdvs.length, hovered]);

  /**
   * Correction index
   */
  useEffect(() => {
    if (index >= visibleRdvs.length) {
      setIndex(0);
    }
  }, [visibleRdvs.length, index]);

  /**
   * Conditions
   */
  if (!isAuthenticated || visibleRdvs.length === 0) {
    return null;
  }

  const current = visibleRdvs[index];

  if (!current) return null;

  return (
    <div
      className="
        fixed
        bottom-5
        left-1/2
        -translate-x-[120%]
        z-[9998]
        pointer-events-none
      "
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.88,
          }}
          animate={
            hovered
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 1,
                  y: [0, -6, 0],
                  scale: [1, 1.015, 1],
                }
          }
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.9,
          }}
          transition={{
            y: hovered
              ? { duration: 0 }
              : {
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                },

            scale: hovered
              ? { duration: 0 }
              : {
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                },

            opacity: {
              duration: 0.4,
            },
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`
            relative
            pointer-events-auto
            overflow-hidden
            rounded-3xl
            border border-white/20
            bg-gradient-to-br
            from-emerald-500/95
            via-green-500/95
            to-teal-500/95
            text-white
            backdrop-blur-2xl
            transition-all
            duration-500
            cursor-pointer
            shadow-[0_8px_40px_rgba(16,185,129,0.45)]
            ${
              hovered
                ? 'w-[92vw] sm:w-[390px]'
                : 'w-[190px] h-[62px]'
            }
          `}
        >
          {/* GLOW ANIMÉ */}
          {!hovered && (
            <>
              {/* Glow */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                }}
                className="
                  absolute
                  -top-10
                  -left-10
                  h-24
                  w-24
                  rounded-full
                  bg-white/20
                  blur-2xl
                "
              />

              {/* Shine */}
              <motion.div
                animate={{
                  x: ['-120%', '220%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: 'linear',
                }}
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  skew-x-[-20deg]
                "
              />

              {/* Breathing border */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(255,255,255,0.1)',
                    '0 0 20px rgba(255,255,255,0.35)',
                    '0 0 0px rgba(255,255,255,0.1)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="
                  absolute
                  inset-0
                  rounded-3xl
                "
              />
            </>
          )}

          {/* MODE OUVERT */}
          {hovered ? (
            <>
              <div className="relative z-10 flex items-start gap-3 p-4">
                {/* Icône fixe */}
                <div
                  className="
                    shrink-0
                    mt-0.5
                    rounded-full
                    bg-white/20
                    p-2
                    backdrop-blur-md
                  "
                >
                  <CalendarClock className="h-5 w-5" />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                      RDV aujourd&apos;hui{' '}
                      {visibleRdvs.length > 1
                        ? `(${index + 1}/${visibleRdvs.length})`
                        : ''}
                    </p>

                    {/* Bouton X */}
                    <motion.button
                      whileHover={{
                        scale: 1.12,
                        rotate: 90,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                      onClick={() =>
                        setDismissed((prev) => {
                          const next = new Set(prev);
                          next.add(current.id);
                          return next;
                        })
                      }
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        hover:bg-red-400
                        transition-colors
                        shadow-lg
                      "
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </motion.button>
                  </div>

                  {/* Titre */}
                  <p className="mt-1 text-sm font-bold truncate">
                    {current.titre || 'Rendez-vous'}
                  </p>

                  {/* Client */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs opacity-95">
                    <User className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {current.clientNom}
                    </span>
                  </div>

                  {/* Heure */}
                  <div className="mt-0.5 text-xs font-mono opacity-95">
                    {current.heureDebut} → {current.heureFin}
                  </div>

                  {/* Lieu */}
                  {current.lieu && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs opacity-90">
                      <MapPin className="h-3 w-3 shrink-0" />

                      <span className="truncate">
                        {current.lieu}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre fixe */}
              <div
                className="
                  h-1
                  bg-gradient-to-r
                  from-white/80
                  via-white/30
                  to-transparent
                "
              />
            </>
          ) : (
            /* MODE MINIMISÉ */
            <div
              className="
                relative
                z-10
                flex
                h-full
                items-center
                justify-between
                px-4
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3 min-w-0">
                {/* ORBE */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                  }}
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/15
                    backdrop-blur-md
                    border border-white/20
                  "
                >
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.4, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    className="
                      absolute
                      inset-0
                      rounded-2xl
                      bg-white/20
                      blur-md
                    "
                  />

                  <CalendarClock className="relative z-10 h-4 w-4" />
                </motion.div>

                {/* TEXT */}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
                    RDV
                  </p>

                  <p className="truncate text-xs font-semibold">
                    {current.heureDebut}
                  </p>
                </div>
              </div>

              {/* DOT */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.3,
                }}
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-white
                  shadow-[0_0_12px_rgba(255,255,255,0.9)]
                "
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalRdvTodayNotifier;