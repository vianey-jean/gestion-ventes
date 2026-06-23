import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Crown,
  Sparkles,
  CalendarDays,
  Clock3,
  Zap,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RdvHeroProps {
  onNewRdv: () => void;
}

type Particle = {
  left: string;
  top: string;
  duration: number;
  delay: number;
  size: number;
};

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
    size: 2 + Math.random() * 2,
  }));

const RdvHero: React.FC<RdvHeroProps> = ({ onNewRdv }) => {
  const particles = useMemo(() => generateParticles(14), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="
        relative overflow-hidden rounded-[36px]
        border border-white/10 bg-black
        px-6 py-10 md:px-10 md:py-14 mb-10
        shadow-[0_40px_140px_-30px_rgba(168,85,247,.5)]
      "
    >
      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <motion.div
          className="absolute -top-28 -right-28 h-[420px] w-[420px] rounded-full bg-amber-500/20 blur-[140px]"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-purple-600/20 blur-[160px]"
          animate={{ x: [0, -30, 40, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute left-1/2 bottom-[-300px] h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[200px]"
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 16, repeat: Infinity }}
        />
      </div>

      {/* ================= GRID ================= */}
      <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* ================= SCAN LINE ================= */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* ================= ORBIT ================= */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      />

      {/* ================= PARTICLES ================= */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/80"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.4, 0.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* ================= TOP BORDER ================= */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

          {/* LEFT */}
          <div>
            {/* BADGE */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl mb-6"
            >
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-amber-100">
                Smart Appointment System
              </span>
              <Sparkles className="h-4 w-4 text-purple-300 animate-spin-slow" />
            </motion.div>

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-amber-200 to-purple-200 bg-clip-text text-transparent">
                Gestion des Rendez-vous
              </span>
            </motion.h1>

            {/* SUBTITLE */}
            <p className="mt-5 text-base md:text-lg text-purple-100/70 max-w-2xl">
              Organisez votre agenda et optimisez votre temps avec une expérience fluide et moderne.
            </p>

            {/* DATE */}
            <div className="mt-5 inline-flex items-center gap-2 text-amber-300 font-medium">
              <CalendarDays className="h-4 w-4" />
              <span className="capitalize">
                {format(new Date(), "MMMM yyyy", { locale: fr })}
              </span>
            </div>

            {/* LIVE STATUS */}
            <motion.div
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2"
              animate={{ boxShadow: ["0 0 10px rgba(16,185,129,.2)", "0 0 25px rgba(16,185,129,.6)", "0 0 10px rgba(16,185,129,.2)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Clock3 className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-bold text-emerald-200">
                AGENDA LIVE
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={onNewRdv}
              aria-label="Créer un nouveau rendez-vous"
              size="lg"
              className="
                h-14 px-8 rounded-2xl font-semibold text-white
                bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500
                shadow-[0_25px_80px_rgba(168,85,247,.5)]
                hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400
              "
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau rendez-vous
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

        </div>
      </div>

      {/* ================= BOTTOM BORDER ================= */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
    </motion.section>
  );
};

export default RdvHero;