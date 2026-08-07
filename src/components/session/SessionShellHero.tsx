/**
 * SessionShellHero.tsx — Hero de la page de conflit de session.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Radar, Lock } from 'lucide-react';

const SessionShellHero: React.FC = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[110px]" />
    </div>

    <div className="relative mx-auto max-w-4xl px-5 pt-12 pb-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-[10px] uppercase tracking-[0.28em] text-violet-200"
      >
        <Radar className="h-3 w-3" /> Sécurité de session
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-5 text-3xl sm:text-5xl font-black leading-tight bg-gradient-to-br from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent"
      >
        Session Conflict
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="mt-3 text-sm sm:text-base text-white/60 max-w-xl mx-auto"
      >
        Un seul appareil à la fois est autorisé pour ce profil. Choisissez comment libérer
        la session distante en toute sécurité.
      </motion.p>

      <div className="mt-6 flex items-center justify-center gap-3 text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
          <Lock className="h-3 w-3 text-emerald-300" /> Chiffré
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
          <Fingerprint className="h-3 w-3 text-violet-300" /> Profil unique
        </span>
      </div>
    </div>
  </section>
);

export default SessionShellHero;
