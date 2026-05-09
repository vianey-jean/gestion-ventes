/**
 * GlobalRdvTodayNotifier
 * --------------------------------------------------------
 * VERSION PREMIUM AUTO-HIDE
 * --------------------------------------------------------
 * ✔ Mobile / Tablette / Desktop
 * ✔ Position fixe à gauche
 * ✔ Auto-hide intelligent
 * ✔ 25s visible
 * ✔ 5s caché
 * ✔ Hover bord gauche = réapparition
 * ✔ Hover desktop
 * ✔ Tap mobile
 * ✔ Glassmorphism
 * ✔ Rotation auto
 * ✔ Animations premium
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

  /**
   * Expanded
   */
  const [expanded, setExpanded] = useState(false);

  /**
   * Auto hide
   */
  const [hiddenLeft, setHiddenLeft] = useState(false);

  /**
   * Charger RDV
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
        //
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
   */
  useEffect(() => {
    if (expanded || hiddenLeft) return;

    if (visibleRdvs.length <= 1) return;

    const itv = setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleRdvs.length);
    }, 6000);

    return () => clearInterval(itv);
  }, [visibleRdvs.length, expanded, hiddenLeft]);

  /**
   * Auto hide cycle
   * 25s visible
   * 5s hidden
   */
  useEffect(() => {
    if (expanded) return;

    const visibleTimer = setTimeout(() => {
      setHiddenLeft(true);

      const hiddenTimer = setTimeout(() => {
        setHiddenLeft(false);
      }, 5000);

      return () => clearTimeout(hiddenTimer);
    }, 25000);

    return () => clearTimeout(visibleTimer);
  }, [hiddenLeft, expanded]);

  /**
   * Mouse near left edge
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 18) {
        setHiddenLeft(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
  }, []);

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
    <>
      {/* ZONE SENSIBLE GAUCHE */}
      {hiddenLeft && (
        <div
          className="
            fixed
            left-0
            top-0
            z-[9997]
            h-full
            w-5
          "
          onMouseEnter={() => setHiddenLeft(false)}
        />
      )}

      <div
        className="
          fixed
          z-[9998]

          bottom-3
          left-3

          sm:bottom-5
          sm:left-5
        "
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.92,
            }}
            animate={
              hiddenLeft
                ? {
                    x: '-92%',
                    opacity: 0.65,
                    scale: 0.96,
                  }
                : expanded
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: 0,
                  }
                : {
                    opacity: 1,
                    y: [0, -5, 0],
                    scale: [1, 1.015, 1],
                    x: 0,
                  }
            }
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            transition={{
              x: {
                duration: 0.7,
                ease: 'easeInOut',
              },

              y: expanded
                ? { duration: 0.2 }
                : {
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  },

              scale: expanded
                ? { duration: 0.2 }
                : {
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  },

              opacity: {
                duration: 0.3,
              },
            }}
            onMouseEnter={() => {
              setExpanded(true);
              setHiddenLeft(false);
            }}
            onMouseLeave={() => {
              setExpanded(false);
            }}
            onClick={() => {
              if (window.innerWidth < 1024) {
                setExpanded((prev) => !prev);
              }
            }}
            className={`
              relative
              overflow-hidden
              cursor-pointer
              pointer-events-auto

              rounded-3xl
              border
              border-white/20

              bg-gradient-to-br
              from-emerald-500/95
              via-green-500/95
              to-teal-500/95

              text-white
              backdrop-blur-2xl

              shadow-[0_8px_40px_rgba(16,185,129,0.45)]

              transition-all
              duration-500

              ${
                expanded
                  ? `
                    w-[92vw]
                    max-w-[420px]

                    sm:w-[360px]
                    md:w-[390px]
                    lg:w-[420px]
                  `
                  : `
                    h-[62px]

                    w-[180px]
                    sm:w-[190px]
                    md:w-[210px]
                  `
              }
            `}
          >
            {/* GLOW */}
            {!expanded && !hiddenLeft && (
              <>
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
                    skew-x-[-20deg]
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                  "
                />
              </>
            )}

            {/* MODE OUVERT */}
            {expanded ? (
              <>
                <div
                  className="
                    relative
                    z-10
                    flex
                    gap-3

                    p-4
                    sm:p-5
                  "
                >
                  {/* ICON */}
                  <div
                    className="
                      mt-0.5
                      shrink-0

                      rounded-full
                      bg-white/20
                      p-2

                      backdrop-blur-md
                    "
                  >
                    <CalendarClock className="h-5 w-5" />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="
                          text-[10px]
                          sm:text-xs

                          font-bold
                          uppercase
                          tracking-wider
                          opacity-90
                        "
                      >
                        RDV aujourd&apos;hui{' '}
                        {visibleRdvs.length > 1
                          ? `(${index + 1}/${visibleRdvs.length})`
                          : ''}
                      </p>

                      {/* CLOSE */}
                      <motion.button
                        whileHover={{
                          scale: 1.1,
                          rotate: 90,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();

                          setDismissed((prev) => {
                            const next = new Set(prev);
                            next.add(current.id);
                            return next;
                          });
                        }}
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center

                          rounded-full
                          bg-red-500

                          shadow-lg
                          transition-colors

                          hover:bg-red-400
                        "
                      >
                        <X className="h-4 w-4 text-white" />
                      </motion.button>
                    </div>

                    {/* TITLE */}
                    <p
                      className="
                        mt-1
                        truncate

                        text-sm
                        sm:text-base

                        font-bold
                      "
                    >
                      {current.titre || 'Rendez-vous'}
                    </p>

                    {/* CLIENT */}
                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        gap-1.5

                        text-xs
                        sm:text-sm

                        opacity-95
                      "
                    >
                      <User className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {current.clientNom}
                      </span>
                    </div>

                    {/* HEURE */}
                    <div
                      className="
                        mt-1

                        text-xs
                        sm:text-sm

                        font-mono
                        opacity-95
                      "
                    >
                      {current.heureDebut} →{' '}
                      {current.heureFin}
                    </div>

                    {/* LIEU */}
                    {current.lieu && (
                      <div
                        className="
                          mt-1
                          flex
                          items-center
                          gap-1.5

                          text-xs
                          sm:text-sm

                          opacity-90
                        "
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          {current.lieu}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BARRE */}
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
                <div className="flex min-w-0 items-center gap-3">
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
                      border
                      border-white/20

                      bg-white/15
                      backdrop-blur-md
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
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-widest
                        text-white/75
                      "
                    >
                      RDV
                    </p>

                    <p
                      className="
                        truncate
                        text-xs
                        sm:text-sm
                        font-semibold
                      "
                    >
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
    </>
  );
};

export default GlobalRdvTodayNotifier;